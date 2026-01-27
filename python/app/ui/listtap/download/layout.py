import flet as ft
from app.ui import factory as f

def setup_download_layout(self):
    """DownloadTab의 외형을 구성하고 주요 위젯을 self에 바인딩합니다."""
    main_row = ft.Row(
        expand=True, 
        spacing=8, 
        vertical_alignment=ft.CrossAxisAlignment.STRETCH
    )

    # 1. 영상 다운로드 섹션
    self.url_entry = ft.TextField(
        hint_text="URL을 입력하세요", 
        expand=True, height=40, content_padding=10,
        border_color=ft.Colors.OUTLINE_VARIANT
    )
    self.add_url_btn = f.create_button("URL 추가", ft.Colors.BLUE_700)
    url_input_row = ft.Row([self.url_entry, self.add_url_btn], spacing=5)

    self.url_list = f.create_list_field()
    self.download_btn = f.create_button("다운로드 시작", ft.Colors.GREEN_700)

    self.download_frame = f.add_input_section(
        " 1. 영상 다운로드 ", url_input_row, self.url_list, [self.download_btn]
    )

    # 2. 영상 폴더 섹션
    self.video_file_list = f.create_list_field()
    self.open_video_folder_btn = f.create_button("폴더 열기", ft.Colors.BLUE_GREY_700)
    self.video_frame = f.add_section(" 2. 영상 폴더 목록 ", self.video_file_list, [self.open_video_folder_btn])

    # 3. 자막 폴더 섹션
    self.subtitle_file_list = f.create_list_field()
    self.subtitle_frame = f.add_section(" 3. 자막 폴더 목록 ", self.subtitle_file_list, [])

    main_row.controls.extend([self.download_frame, self.video_frame, self.subtitle_frame])
    self.controls = [main_row]

def clear_download_url_input(url_entry_widget):
    url_entry_widget.value = ""
    url_entry_widget.update()