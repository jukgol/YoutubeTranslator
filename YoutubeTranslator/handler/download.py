import threading
import yt_dlp
from logic.downloader import download_video_full

class DownloadHandler:
    def __init__(self, bridge, url_manager, path):
        self.ui = bridge
        self.logic = url_manager
        self.path = path
        self.is_running = False

    def sync_queue_ui(self):
        """1번 코드의 3줄 로그 스타일로 UI 갱신"""
        all_items = self.logic.pending + self.logic.in_progress + self.logic.completed
        
        # UI의 리스트박스 또는 텍스트 영역 초기화 후 다시 그리기
        # (여기서는 1번 코드의 listbox_queue.insert 방식을 가정합니다)
        lines = []
        for item in all_items:
            lines.extend(item.to_ui_lines())
            lines.append("") # 항목 간 간격
            
        # UI 브릿지를 통해 화면 업데이트 요청
        self.ui.ui_update_queue_display(lines)        

    def handle_add_url(self, url):
        """URL 추가 + 비동기 제목 가져오기"""
        new_item, msg = self.logic.add_url(url)
        self.ui.log(msg)
        
        if new_item:
            self.ui.ui_clear_download_url_input()
            self.sync_queue_ui()
            # 별도 쓰레드에서 제목 가져오기 실행
            threading.Thread(target=self._fetch_title_async, args=(new_item,), daemon=True).start()

    def _fetch_title_async(self, item):
        """yt-dlp로 제목만 가져와서 UI 갱신"""
        try:
            ydl_opts = {'quiet': True, 'extract_flat': True, 'no_warnings': True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(item.url, download=False)
                item.title = info.get('title', item.url)
            # 메인 스레드에서 UI 갱신
            self.ui.root.after(0, self.sync_queue_ui)
        except: pass

    def start_download(self):
        if self.is_running:
            self.ui.log("이미 작업이 진행 중입니다.")
            return
        
        self.is_running = True
        threading.Thread(target=self._run_download_process, daemon=True).start()

    def _run_download_process(self):
        """순차적 다운로드 공정"""
        while self.is_running:
            item = self.logic.get_next()
            if not item: break

            item.status = "다운로드 중"
            self.ui.root.after(0, self.sync_queue_ui)

            # 실제 다운로드 실행 (2번 코드의 마법의 연결고리)
            video_title = download_video_full(
                url=item.url,
                path_manager=self.path,
                log_callback=self.ui.log
            )

            if video_title:
                item.title = video_title
                self.logic.mark_as_done(item)
            else:
                self.logic.mark_as_failed(item)
            
            self.ui.root.after(0, self.sync_queue_ui)
            # 폴더 목록 갱신 (2번 코드 기능)
            if hasattr(self, 'refresh_folder_lists'):
                self.ui.root.after(0, self.refresh_folder_lists)

        self.is_running = False
        self.ui.log("모든 작업을 마쳤습니다.")

    def refresh_folder_lists(self):
        """실제 폴더를 스캔하여 UI의 영상/자막 목록을 갱신합니다."""
        # path_service는 프로젝트 구조에 맞게 임포트 경로를 확인해주세요.
        from app.path_service import get_folder_files 

        # 1. 영상 폴더 스캔
        # self.ui.path 객체는 브릿지에서 연결되어 있어야 합니다.
        video_files = get_folder_files(
        self.ui.path.video_dir, 
        extensions=('.mp4', '.mkv', '.avi') # mp4 외에 흔한 영상포맷 포함 추천
        )

        video_text = self._format_file_list(video_files, "🎬")
        self.ui.ui_set_video_folder_list(video_text)

        # 2. 자막 폴더 스캔
        sub_files = get_folder_files(self.ui.path.origin_dir)
        sub_text = self._format_file_list(sub_files, "📝")
        self.ui.ui_set_subtitle_folder_list(sub_text)

    def _format_file_list(self, file_list, icon):
        """파일 리스트를 1번 코드 느낌의 예쁜 텍스트로 가공"""
        if not file_list:
            return "파일이 없습니다."
        
        lines = []
        for f in file_list:
            lines.append(f"{icon} {f}")
            lines.append("-" * 25) # 구분선
        return "\n".join(lines)