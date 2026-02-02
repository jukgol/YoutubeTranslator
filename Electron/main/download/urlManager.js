const log = require('../js/logManager');
// downloadHelper에서 두 함수를 모두 가져옴
const { _runDownloadProcess, _fetchTitleAsync } = require('../download/downloadHelper.js');

class DownloadItem {
    constructor(id, url) {
        this.id = id;
        this.url = url.split('?')[0];
        this.title = "🔍 제목 확인 중...";
        this.status = "대기";
    }

    toUiLines() {
        const symbols = { "대기": "⏳", "제목 확인 완료": "📝", "다운로드 중": "📥", "완료": "✅", "실패": "❌" };
        const symbol = symbols[this.status] || "•";

        const separator = `${'='.repeat(12)} [ ${symbol} ${this.status} ] ${'='.repeat(12)}`;
        const lineId = ` ID: ${this.id}`;
        const lineTitle = ` 제목: ${this.title}`;
        const lineUrl = ` URL: ${this.url}`;
        return [separator, lineId, lineTitle, lineUrl];
    }
}

class UrlManager {
    constructor() {
        this.pending = [];
        this.inProgress = [];
        this.completed = [];
        this.failed = [];
        this.counterInterval = null;
        this.currentCount = 0;
        this.nextId = 0;
        this._mainWindow = null;
    }

    setMainWindow(mainWindow) {
        this._mainWindow = mainWindow;
    }

    addUrl(url) {
        url = url.trim();
        if (!url) {
            log.write("URL이 비어 있습니다.");
            return null;
        }

        const allItems = [...this.pending, ...this.inProgress, ...this.completed, ...this.failed];
        if (allItems.some(item => item.url === url)) {
            log.write("이미 목록에 존재하는 URL입니다.");
            return null;
        }

        const newItem = new DownloadItem(this.nextId++, url);
        this.pending.push(newItem);
        log.write("대기열에 추가되었습니다.");

        // 내부 로직을 지우고 downloadHelper의 함수를 호출
        this.fetchUrlTitle(newItem);
        return newItem;
    }

    removeUrl(urlToRemove) {
        urlToRemove = urlToRemove.split('?')[0];
        const initialLength = this.pending.length;
        this.pending = this.pending.filter(item => item.url !== urlToRemove);
        return this.pending.length < initialLength;
    }

    clearUrlList() {
        this.pending = [];
        this.inProgress = []; // (Optional) Do we want to stop running items? For now just clear the list references
        this.failed = [];
        log.write("대기 목록이 초기화되었습니다.");
        return true;
    }

    // downloadHelper의 _fetchTitleAsync를 호출하도록 수정
    async fetchUrlTitle(item) {
        try {
            await _fetchTitleAsync(item.url, item);

            if (item.title !== "유효하지 않은 URL 또는 접근 제한" && item.title !== "제목을 찾을 수 없음") {
                item.status = "제목 확인 완료";
            } else {
                item.status = "실패";
            }

            if (this._mainWindow) {
                this._mainWindow.webContents.send('urlManager:item-updated', {
                    id: item.id,
                    title: item.title,
                    status: item.status
                });
            }
        } catch (error) {
            item.status = "실패";
            if (this._mainWindow) {
                this._mainWindow.webContents.send('urlManager:item-updated', {
                    id: item.id,
                    title: item.title,
                    status: item.status
                });
            }
        }
    }

    getNext() {
        if (this.pending.length === 0) return null;
        const item = this.pending.shift();
        this.inProgress.push(item);
        return item;
    }

    markAsDone(item) {
        const index = this.inProgress.indexOf(item);
        if (index > -1) {
            this.inProgress.splice(index, 1);
            item.status = "완료";
            this.completed.push(item);
            if (this._mainWindow) {
                this._mainWindow.webContents.send('urlManager:item-updated', {
                    id: item.id,
                    title: item.title,
                    status: item.status
                });
            }
        }
    }

    markAsFailed(item) {
        const index = this.inProgress.findIndex(p => p.id === item.id);
        if (index > -1) {
            this.inProgress.splice(index, 1);
        }
        item.status = "실패";
        this.failed.push(item);
        if (this._mainWindow) {
            this._mainWindow.webContents.send('urlManager:item-updated', {
                id: item.id,
                title: item.title,
                status: item.status
            });
        }
    }

    startTestCounter(limit = 10) {
        if (this.counterInterval) {
            log.write("테스트 카운터가 이미 실행 중입니다.");
            return;
        }
        log.write("테스트 카운터 시작...");
        this.currentCount = 0;
        this.counterInterval = setInterval(() => {
            this.currentCount++;
            if (this.currentCount <= limit) {
                log.write(`[테스트 카운터] 현재 숫자: ${this.currentCount}`, true);
            } else {
                clearInterval(this.counterInterval);
                this.counterInterval = null;
                log.write("테스트 카운터 종료.");
            }
        }, 1000);
    }

    async startDownload(quality = 'best', downloadSubs = true) {
        if (this.failed.length > 0) {
            log.write(`${this.failed.length}개의 실패 항목을 다시 확인합니다...`);
            this.pending.push(...this.failed);
            this.failed = [];
        }

        if (this.pending.length === 0) {
            log.write("처리할 항목이 대기열에 없습니다.");
            return;
        }

        while (this.pending.length > 0) {
            const item = this.pending.shift();

            if (item.status !== '제목 확인 완료') {
                log.write(`[${item.id}] 항목이 다운로드 준비 상태가 아니므로 실패 목록으로 이동합니다. (상태: ${item.status})`);
                this.failed.push(item);
                continue;
            }

            item.status = "다운로드 중";
            this.inProgress.push(item);
            if (this._mainWindow) {
                this._mainWindow.webContents.send('urlManager:item-updated', {
                    id: item.id,
                    title: item.title,
                    status: item.status
                });
            }

            try {
                await _runDownloadProcess(item.url, item.title, quality, downloadSubs);
                this.markAsDone(item);
            } catch (error) {
                this.markAsFailed(item);
            }
        }
        log.write("모든 다운로드 작업이 완료되었습니다.");
    }

    getCompleted() { return this.completed; }
    clearCompleted() {
        this.completed = [];
        return true;
    }
}

const urlManager = new UrlManager();
module.exports = { DownloadItem, urlManager };