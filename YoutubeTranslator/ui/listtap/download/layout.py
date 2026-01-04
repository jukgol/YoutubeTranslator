import flet as ft
import ui.factory as f  # 완성된 공통 팩토리

def setup_download_layout(self):
    """DownloadTab의 레이아웃을 factory 기능을 사용하여 재구성합니다."""
    
    # 전체를 가로로 배치할 메인 Row
    main_row = ft.Row(
        expand=True, 
        spacing=8, 
        vertical_alignment=ft.CrossAxisAlignment.STRETCH
    )

    # --- 1. 영상 다운로드 섹션 (확장형: add_input_section 사용) ---
    # URL 입력 영역 (input_widget)
    self.url_entry = ft.TextField(
        hint_text="URL을 입력하세요", 
        expand=True, 
        height=40, 
        content_padding=10,
        border_color=ft.Colors.OUTLINE_VARIANT
    )
    self.add_url_btn = ft.ElevatedButton(
        "URL 추가", 
        bgcolor=ft.Colors.BLUE_700, 
        color=ft.Colors.WHITE,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
    )
    url_input_row = ft.Row([self.url_entry, self.add_url_btn], spacing=5)

    # 중앙 리스트 및 하단 버튼
    self.url_list = f.create_list_field()
    self.download_btn = f.create_button("다운로드 시작", ft.Colors.GREEN_700)

    # 확장형 섹션 함수 호출
    self.download_frame = f.add_input_section(
        " 1. 영상 다운로드 ", 
        url_input_row, 
        self.url_list, 
        [self.download_btn]
    )

    # --- 2. 영상 폴더 섹션 (기본형: add_section 사용) ---
    self.video_file_list = f.create_list_field()
    self.open_video_folder_btn = f.create_button("폴더 열기", ft.Colors.BLUE_GREY_700)
    
    self.video_frame = f.add_section(
        " 2. 영상 폴더 목록 ", 
        self.video_file_list, 
        [self.open_video_folder_btn]
    )

    # --- 3. 자막 폴더 섹션 (기본형: add_section 사용) ---
    self.subtitle_file_list = f.create_list_field()
    # 버튼이 없는 경우 빈 리스트 전달
    self.subtitle_frame = f.add_section(
        " 3. 자막 폴더 목록 ", 
        self.subtitle_file_list, 
        []
    )

    # 메인 레이아웃에 통합된 프레임들 추가
    main_row.controls.extend([
        self.download_frame, 
        self.video_frame, 
        self.subtitle_frame
    ])
    
    self.controls = [main_row]