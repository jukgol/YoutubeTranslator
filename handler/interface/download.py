class DownloadInterface:
    def __init_download_tab__(self, download_tab):
        """탭 위젯 연결"""
        self.download_tab = download_tab

    def process_add_download_url(self, url): # <-- 여기서 'url'을 받도록 수정!
        """UI로부터 전달받은 URL 문자열을 처리합니다."""
        if not url:
            return 
        # 실제 일꾼(self.download)에게 받은 데이터를 전달합니다.
        self.download.handle_add_url(url)

    def process_clear_download_queue(self):
        """[비우기] 버튼 명령 전달"""
        self.download.handle_clear_queue()

    def process_start_download(self):
        """[시작] 버튼 명령 전달"""
        self.download.start_download()

    def process_refresh_download_list(self):
        """수동 새로고침 버튼이 있다면 연결"""
        self.download.sync_queue_ui()