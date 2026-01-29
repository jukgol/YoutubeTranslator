const log = require('../js/logManager'); // 경로 수정
const YTDlpWrap = require('yt-dlp-wrap').default; // Use yt-dlp-wrap
const path = require('path');
const fs = require('fs');

class DownloadItem {
    constructor(id, url) {
        this.id = id;
        this.url = url.split('?')[0]; // 파라미터 제거
        this.title = "🔍 제목 확인 중...";
        this.status = "대기"; // 대기, 제목 확인 완료, 다운로드 중, 완료, 실패
    }

    toUiLines() {
        const symbols = { "대기": "⏳", "제목 확인 완료": "📝", "다운로드 중": "📥", "완료": "✅", "실패": "❌" };
        const symbol = symbols[this.status] || "•";
        
        const separator = `${'='.repeat(12)} [ ${symbol} ${this.status} ] ${'='.repeat(12)}`;
        const lineId = ` ID: ${this.id}`; // ID 추가
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
        this.counterInterval = null; // To store the interval ID
        this.currentCount = 0;
        this.nextId = 0; // nextId 속성 추가
        this._mainWindow = null; // _mainWindow 속성 추가
        this.ytDlpWrap = null; // Initialize ytDlpWrap to null
    }

    async initialize() {
        if (!this.ytDlpWrap) { // Only download if not already initialized
            try {
                log.write("Checking for yt-dlp binary...");
                const binDir = path.join(__dirname, '..', '..', 'bin'); // Electron/bin
                const ytDlpPath = path.join(binDir, 'yt-dlp.exe');

                // Ensure the bin directory exists
                if (!fs.existsSync(binDir)) {
                    fs.mkdirSync(binDir, { recursive: true });
                }

                await YTDlpWrap.downloadFromGithub(ytDlpPath); // Specify target path
                log.write(`yt-dlp binary downloaded to: ${ytDlpPath}`);
                this.ytDlpWrap = new YTDlpWrap(ytDlpPath); // Instantiate with the downloaded path
            } catch (error) {
                log.write(`Failed to prepare yt-dlp binary: ${error.message}`);
                // Handle the error, maybe disable functionality or show a message to the user
                throw error; // Re-throw to propagate the error
            }
        }
    }

    setMainWindow(mainWindow) { // setMainWindow 메서드 추가
        this._mainWindow = mainWindow;
    }

    addUrl(url) {
        url = url.trim();
        if (!url) {
            log.write("URL이 비어 있습니다.");
            return null;
        }

        // 중복 체크
        const allItems = [...this.pending, ...this.inProgress, ...this.completed];
        if (allItems.some(item => item.url === url)) {
            log.write("이미 목록에 존재하는 URL입니다.");
            return null;
        }

        const newItem = new DownloadItem(this.nextId++, url); // ID 부여 및 증가
        this.pending.push(newItem);
        log.write("대기열에 추가되었습니다.");
        this.fetchUrlTitle(newItem.url); // 제목 가져오기 시작
        return newItem;
    }

    removeUrl(urlToRemove) {
        urlToRemove = urlToRemove.split('?')[0]; // Ensure parameter-less URL for comparison
        const initialLength = this.pending.length;
        this.pending = this.pending.filter(item => item.url !== urlToRemove);
        return this.pending.length < initialLength; // Return true if an item was removed
    }

    async fetchUrlTitle(url) {
        if (!this.ytDlpWrap) {
            log.write("YTDlpWrap is not initialized. Cannot fetch title.");
            return null;
        }
        try {
            const info = await this.ytDlpWrap.getVideoInfo(url);
            const title = info.title;
            log.write(`URL (${url}) 제목 가져오기 성공: ${title}`);

            const existingItem = [...this.pending, ...this.inProgress, ...this.completed]
                                .find(item => item.url === url);
            if (existingItem) {
                existingItem.title = title;
                existingItem.status = "제목 확인 완료";
                if (this._mainWindow) {
                    this._mainWindow.webContents.send('urlManager:item-updated', { 
                        id: existingItem.id, 
                        title: existingItem.title, 
                        status: existingItem.status 
                    });
                }
            }
            return title;
        } catch (error) {
            log.write(`URL (${url}) 제목 가져오기 실패: ${error.message}`);
            // Find the item to update its status to '실패'
            const existingItem = [...this.pending, ...this.inProgress, ...this.completed]
                                .find(item => item.url === url);
            if (existingItem) {
                existingItem.status = "실패";
                if (this._mainWindow) {
                    this._mainWindow.webContents.send('urlManager:item-updated', { 
                        id: existingItem.id, 
                        title: existingItem.title, 
                        status: existingItem.status 
                    });
                }
            }
            return null;
        }
    }

    getNext() {
        if (this.pending.length === 0) {
            return null;
        }
        const item = this.pending.shift(); // Removes the first element and returns it
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
        const index = this.inProgress.indexOf(item);
        if (index > -1) {
            this.inProgress.splice(index, 1);
            item.status = "실패";
        }
    }

    // New test function: starts a counter that logs to console
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
                log.write(`[테스트 카운터] 현재 숫자: ${this.currentCount}`, true); // Use replace: true
            } else {
                clearInterval(this.counterInterval);
                this.counterInterval = null;
                log.write("테스트 카운터 종료.");
            }
        }, 1000);
    }

    getCompleted() {
        return this.completed;
    }

    clearCompleted() {
        this.completed = [];
        return true;
    }
}

// 모듈 수준에서 UrlManager의 싱글톤 인스턴스 생성
const urlManager = new UrlManager();

// registerUrlManagerHandlers 함수는 제거되었습니다.

module.exports = {
    DownloadItem,
    urlManager,
};