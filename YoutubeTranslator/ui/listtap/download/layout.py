import flet as ft

def setup_download_layout(self):
    """DownloadTab의 모든 위젯을 생성하고 배치합니다."""
    
    # 전체를 가로로 배치할 메인 Row
    main_row = ft.Row(expand=True, spacing=5, vertical_alignment=ft.CrossAxisAlignment.STRETCH)

    # --- 1. 영상 다운로드 카테고리 (왼쪽) ---
    # URL 입력부 (TextField + Button)
    self.url_entry = ft.TextField(hint_text="URL을 입력하세요", expand=True, height=40, content_padding=10)
    self.add_url_btn = ft.ElevatedButton("URL 추가", bgcolor=ft.colors.BLUE_700, color=ft.colors.WHITE)
    
    url_input_row = ft.Row([self.url_entry, self.add_url_btn], spacing=5)

    # URL 리스트 (Tkinter의 Text 대응)
    self.url_list = ft.TextField(multiline=True, expand=True, read_only=True, text_size=12)

    # 다운로드 버튼
    self.download_btn = ft.ElevatedButton(
        "다운로드 시작", 
        bgcolor=ft.colors.GREEN_700, 
        color=ft.colors.WHITE, 
        height=50,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
    )

    # 1번 섹션 조립
    download_section = ft.Container(
        expand=True,
        border=ft.border.all(1, ft.colors.OUTLINE),
        border_radius=8,
        padding=10,
        content=ft.Column([
            ft.Text(" 1. 영상 다운로드 ", weight=ft.FontWeight.BOLD),
            url_input_row,
            self.url_list,
            self.download_btn
        ], spacing=10)
    )

    # --- 2. 영상 폴더 카테고리 (중간) ---
    # 헬퍼 함수를 통해 기본 틀 생성
    video_container, video_inner_col, self.video_file_list = create_list_area(" 2. 영상 폴더 목록 ")
    
    # 폴더 열기 버튼 추가
    self.open_video_folder_btn = ft.ElevatedButton(
        "폴더 열기", 
        bgcolor=ft.colors.BLUE_GREY_700, 
        color=ft.colors.WHITE,
        height=40,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
    )
    video_inner_col.controls.append(self.open_video_folder_btn)

    # --- 3. 자막 폴더 카테고리 (오른쪽) ---
    subtitle_container, _, self.subtitle_file_list = create_list_area(" 3. 자막 폴더 목록 ")

    # 메인 레이아웃에 섹션들 추가
    main_row.controls.extend([download_section, video_container, subtitle_container])
    
    # DownloadTab(ft.Column)의 controls에 추가
    self.controls = [main_row]

def create_list_area(title):
    """공통 리스트 영역(TextField) 생성 헬퍼 함수"""
    text_widget = ft.TextField(
        multiline=True, 
        expand=True, 
        read_only=True, 
        text_size=12,
        text_style=ft.TextStyle(font_family="Consolas")
    )
    
    inner_col = ft.Column([
        ft.Text(title, weight=ft.FontWeight.BOLD),
        text_widget
    ], spacing=10, expand=True)
    
    container = ft.Container(
        expand=True,
        border=ft.border.all(1, ft.colors.OUTLINE),
        border_radius=8,
        padding=10,
        content=inner_col
    )
    
    return container, inner_col, text_widget