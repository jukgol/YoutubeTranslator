from app.path import paths
from app.path_service import open_folder_in_explorer


def connect_download_events(self):   
    
    # URL 추가 (버튼 클릭 & 엔터 입력)
    self.add_url_btn.on_click = lambda _: self.download.handle_add_url(self.url_entry.value.strip())
    self.url_entry.on_submit = lambda _: self.download.handle_add_url(self.url_entry.value.strip())

    # 다운로드 시작
    self.download_btn.on_click = lambda _: self.download.start_download()

    # 폴더 열기
    self.open_video_folder_btn.on_click = lambda _: open_folder_in_explorer(paths.video_dir)

    self.on_active = lambda _: self.download.sync_queue_ui()