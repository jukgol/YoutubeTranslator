from app import paths
from app.path_service import open_folder_in_explorer

def connect_download_events(self, handler):
    """버튼과 키 입력을 핸들러의 로직 함수와 연결합니다."""
    h = handler
    
    # URL 추가 (버튼 클릭 & 엔터 입력)
    self.add_url_btn.on_click = lambda _: h.process_add_download_url(self.url_entry.value.strip())
    self.url_entry.on_submit = lambda _: h.process_add_download_url(self.url_entry.value.strip())

    # 다운로드 시작
    self.download_btn.on_click = lambda _: h.process_start_download()

    # 폴더 열기
    self.open_video_folder_btn.on_click = lambda _: open_folder_in_explorer(paths.video_dir)

    self.on_active = lambda _: h.download.refresh_folder_lists()