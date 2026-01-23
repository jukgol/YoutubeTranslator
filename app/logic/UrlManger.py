import threading

class DownloadItem:
    def __init__(self, url):
        self.url = url.split('?')[0]  # 파라미터 제거
        self.title = "🔍 제목 확인 중..."
        self.status = "대기"  # 대기, 다운로드 중, 완료, 실패

    def to_ui_lines(self):
        """1번 코드의 그 예쁜 3줄 로그 포맷"""
        symbols = {"대기": "⏳", "다운로드 중": "📥", "완료": "✅", "실패": "❌"}
        symbol = symbols.get(self.status, "•")
        
        separator = f"{'='*12} [ {symbol} {self.status} ] {'='*12}"
        line_title = f" 제목: {self.title}"
        line_url   = f" URL: {self.url}"
        return [separator, line_title, line_url]

class UrlManager:
    def __init__(self):
        self.pending = []
        self.in_progress = []
        self.completed = []

    def add_url(self, url):
        url = url.strip()
        if not url: return None, "URL이 비어 있습니다."

        # 중복 체크
        all_items = self.pending + self.in_progress + self.completed
        if any(item.url == url for item in all_items):
            return None, "이미 목록에 존재하는 URL입니다."

        new_item = DownloadItem(url)
        self.pending.append(new_item)
        return new_item, "대기열에 추가되었습니다."

    def get_next(self):
        if not self.pending: return None
        item = self.pending.pop(0)
        self.in_progress.append(item)
        return item

    def mark_as_done(self, item):
        if item in self.in_progress:
            self.in_progress.remove(item)
            item.status = "완료"
            self.completed.append(item)

    def mark_as_failed(self, item):
        if item in self.in_progress:
            self.in_progress.remove(item)
            item.status = "실패"

# 모듈 수준에서 UrlManager의 싱글톤 인스턴스 생성
url_manager = UrlManager()