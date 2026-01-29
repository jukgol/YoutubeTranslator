const log = require('../js/logManager');
const ytdl = require('ytdl-core');
const { _fetchTitleAsync } = require('./downloadHelper'); // _fetchTitleAsync 가져오기

class DownloadItem {
    constructor(id, url) {
        this.id = id;
        this.url = url.split('?')[0]; // 파라미터 제거
        this.title = "🔍 제목 확인 중...";
        this.status = "대기"; // 대기, 다운로드 중, 완료, 실패
    }

    toUiLines() {
        const symbols = { "대기": "⏳", "다운로드 중": "📥", "완료": "✅", "실패": "❌" };
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
        return newItem;
    }

    removeUrl(urlToRemove) {
        urlToRemove = urlToRemove.split('?')[0]; // Ensure parameter-less URL for comparison
        const initialLength = this.pending.length;
        this.pending = this.pending.filter(item => item.url !== urlToRemove);
        return this.pending.length < initialLength; // Return true if an item was removed
    }

    async fetchUrlTitle(url) {
        // _fetchTitleAsync에 전달하기 위해 임시 DownloadItem 생성
        const tempItem = new DownloadItem(null, url); // ID는 null로 임시 처리
        await _fetchTitleAsync(url, tempItem); // _fetchTitleAsync 호출
        return tempItem.title; // 업데이트된 타이틀 반환
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
        }
    }

    markAsFailed(item) {
        const index = this.inProgress.indexOf(item);
        if (index > -1) {
            this.inProgress.splice(index, 1);
            item.status = "실패";
        }
    }
}

// 모듈 수준에서 UrlManager의 싱글톤 인스턴스 생성
const urlManager = new UrlManager();

// registerUrlManagerHandlers 함수 추가
// registerUrlManagerHandlers 함수 추가
// export const registerUrlManagerHandlers = (ipcMain) => {
//     ipcMain.handle('system:start-test-counter', async () => {
//       urlManager.startTestCounter();
//       return true;
//     });

//     ipcMain.handle('urlManager:add-url', async (event, url) => {
//         const item = urlManager.addUrl(url);
//         return item;
//     });

//     ipcMain.handle('urlManager:remove-url', async (event, url) => {
//         const removed = urlManager.removeUrl(url);
//         return removed;
//     });

//     ipcMain.handle('urlManager:fetch-url-title', async (event, url) => {
//         const title = await urlManager.fetchUrlTitle(url);
//         return title;
//     });

//     ipcMain.handle('urlManager:get-next', async () => {
//         const item = urlManager.getNext();
//         return item;
//     });
// };

module.exports = {
    DownloadItem,
    urlManager,
};