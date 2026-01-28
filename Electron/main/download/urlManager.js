const log = require('../js/logManager'); // Import logManager

class DownloadItem {
    constructor(url) {
        this.url = url.split('?')[0]; // 파라미터 제거
        this.title = "🔍 제목 확인 중...";
        this.status = "대기"; // 대기, 다운로드 중, 완료, 실패
    }

    toUiLines() {
        const symbols = { "대기": "⏳", "다운로드 중": "📥", "완료": "✅", "실패": "❌" };
        const symbol = symbols[this.status] || "•";
        
        const separator = `${'='.repeat(12)} [ ${symbol} ${this.status} ] ${'='.repeat(12)}`;
        const lineTitle = ` 제목: ${this.title}`;
        const lineUrl = ` URL: ${this.url}`;
        return [separator, lineTitle, lineUrl];
    }
}

class UrlManager {
    constructor() {
        this.pending = [];
        this.inProgress = [];
        this.completed = [];
        this.counterInterval = null; // To store the interval ID
        this.currentCount = 0;
    }

    addUrl(url) {
        url = url.trim();
        if (!url) {
            return [null, "URL이 비어 있습니다."];
        }

        // 중복 체크
        const allItems = [...this.pending, ...this.inProgress, ...this.completed];
        if (allItems.some(item => item.url === url)) {
            return [null, "이미 목록에 존재하는 URL입니다."];
        }

        const newItem = new DownloadItem(url);
        this.pending.push(newItem);
        return [newItem, "대기열에 추가되었습니다."];
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
}

// 모듈 수준에서 UrlManager의 싱글톤 인스턴스 생성
const urlManager = new UrlManager();

module.exports = {
    DownloadItem,
    urlManager
};