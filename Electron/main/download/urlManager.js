const log = require('../js/logManager'); // 경로 수정
const path = require('path');
const fs = require('fs');
const appEnv = require('../appEnv/appEnv'); // Import the AppEnv singleton
const { _runDownloadProcess } = require('../download/downloadHelper.js');

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
        this.failed = []; // 실패 목록 추가
        this.counterInterval = null; // To store the interval ID
        this.currentCount = 0;
        this.nextId = 0; // nextId 속성 추가
        this._mainWindow = null; // _mainWindow 속성 추가        
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
        const allItems = [...this.pending, ...this.inProgress, ...this.completed, ...this.failed];
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
        const index = this.inProgress.findIndex(p => p.id === item.id);
        if (index > -1) {
            this.inProgress.splice(index, 1);
        }
        item.status = "실패";
        this.failed.push(item); // Add to failed list
        if (this._mainWindow) {
            this._mainWindow.webContents.send('urlManager:item-updated', {
                id: item.id,
                title: item.title,
                status: item.status
            });
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

    async startDownload() {
        // 1. Move all previously failed items back to the pending queue to be re-evaluated.
        if (this.failed.length > 0) {
            log.write(`${this.failed.length}개의 실패 항목을 다시 확인합니다...`);
            this.pending.push(...this.failed);
            this.failed = [];
        }
    
        if (this.pending.length === 0) {
            log.write("처리할 항목이 대기열에 없습니다.");
            return;
        }

        // 2. Process the pending queue until it's empty.
        while (this.pending.length > 0) {
            const item = this.pending.shift();
    
            // 3. Check if the item is ready for download.
            if (item.status !== '제목 확인 완료') {
                log.write(`[${item.id}] 항목이 다운로드 준비 상태가 아니므로 실패 목록으로 이동합니다. (상태: ${item.status})`);
                this.failed.push(item);
                continue; // Move to the next item in the pending queue.
            }
    
            // 4. If ready, proceed with the download process.
            item.status = "다운로드 중";
            this.inProgress.push(item);
            // Notify UI that we are starting
            if (this._mainWindow) {
                this._mainWindow.webContents.send('urlManager:item-updated', {
                    id: item.id,
                    title: item.title,
                    status: item.status
                });
            }
            
            try {
                const appPaths = { video_dir: appEnv.pathData.videoDir };
                await _runDownloadProcess(appPaths, item.id, item.url, item.title);
                this.markAsDone(item); // On success, mark as done
            } catch (error) {
                this.markAsFailed(item); // On failure, mark as failed
            }

        } // End of while loop
    
        log.write("모든 다운로드 작업이 완료되었습니다.");
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