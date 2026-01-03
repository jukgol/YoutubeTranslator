from app import paths  # 모듈 자체를 가져옵니다.
from app.path_service import open_folder_in_explorer

def connect_download_events(self):

    """버튼 클릭 시 UI 데이터를 추출하여 핸들러로 보냅니다."""
    h = self.handler
    
    # URL 추가 버튼: UI가 직접 Entry 값을 읽어서 '데이터(문자열)'만 핸들러에게 전달
    self.add_url_btn.config(command=lambda: h.process_add_download_url(self.url_entry.get().strip()))
    
    # 엔터 키 바인딩
    self.url_entry.bind("<Return>", lambda e: h.process_add_download_url(self.url_entry.get().strip()))

    # 다운로드 시작 버튼
    self.download_btn.config(command=h.process_start_download)

    self.open_video_folder_btn.config(
        command=lambda: open_folder_in_explorer(paths.video_dir)
    )