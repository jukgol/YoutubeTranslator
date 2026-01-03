import flet as ft

def setup_simple_layout(self):
    """SimpleTab의 모든 위젯을 생성하고 배치합니다."""
    
    # 전체를 가로로 배치할 메인 Row
    main_row = ft.Row(expand=True, spacing=5, vertical_alignment=ft.CrossAxisAlignment.STRETCH)

    # --- 1. 원본 데이터 영역 ---
    self.origin_frame, inner_col1, self.origin_list = create_list_area(" 1. 원본 데이터 ")
    
    self.add_to_queue_btn = ft.ElevatedButton(
        "리스트 추가", bgcolor=ft.colors.BLUE_700, color=ft.colors.WHITE, expand=True, height=45
    )
    self.clear_queue_btn = ft.ElevatedButton(
        "큐 초기화", bgcolor=ft.colors.GREY_700, color=ft.colors.WHITE, expand=True, height=45
    )
    
    inner_col1.controls.append(ft.Row([self.add_to_queue_btn, self.clear_queue_btn], spacing=2))

    # --- 2. 작업 큐 영역 ---
    self.queue_frame, inner_col2, self.queue_list = create_list_area(" 2. 작업 큐 ")
    
    self.queue_start_btn = ft.ElevatedButton(
        "번역 시작", bgcolor=ft.colors.GREEN_700, color=ft.colors.WHITE, expand=True, height=45
    )
    self.queue_stop_btn = ft.ElevatedButton(
        "멈춤", bgcolor=ft.colors.RED_700, color=ft.colors.WHITE, expand=True, height=45
    )
    
    inner_col2.controls.append(ft.Row([self.queue_start_btn, self.queue_stop_btn], spacing=2))

    # --- 3. 진행 상태 영역 ---
    steps = ["원본 분리 중", "번역 진행 중", "파트 합치는 중", "최종 결합 중", "모든 공정 완료"]
    self.process_labels = [] # __init__.py에서 사용함
    
    status_inner_col = ft.Column(spacing=5, expand=True)
    
    for step in steps:
        # 상태 변화(배경색/글자색)를 위해 Container로 감쌈
        lbl_container = ft.Container(
            content=ft.Text(f"• {step}", size=14, color=ft.colors.GREY_400),
            padding=ft.padding.all(8),
            border_radius=5,
        )
        status_inner_col.controls.append(lbl_container)
        self.process_labels.append(lbl_container)

    self.status_stop_btn = ft.ElevatedButton(
        "멈춤", bgcolor=ft.colors.RED_700, color=ft.colors.WHITE, height=45, width=float("inf")
    )
    
    # 멈춤 버튼을 아래에 배치하기 위해 Column 구성
    status_layout_col = ft.Column([
        ft.Text(" 3. 진행 상태 ", weight=ft.FontWeight.BOLD),
        status_inner_col,
        self.status_stop_btn
    ], expand=True)

    self.status_frame = ft.Container(
        expand=True,
        border=ft.border.all(1, ft.colors.OUTLINE),
        border_radius=8,
        padding=10,
        content=status_layout_col
    )

    # --- 4. 최종 결과 영역 ---
    self.result_frame, inner_col4, self.result_list = create_list_area(" 4. 최종 결과 ")
    
    self.move_file_btn = ft.ElevatedButton(
        "파일 복사", bgcolor=ft.colors.PURPLE_700, color=ft.colors.WHITE, height=45, width=float("inf")
    )
    inner_col4.controls.append(self.move_file_btn)

    # 메인 레이아웃에 섹션들 추가
    main_row.controls.extend([self.origin_frame, self.queue_frame, self.status_frame, self.result_frame])
    
    # SimpleTab(ft.Column)의 controls에 추가
    self.controls = [main_row]

def create_list_area(title):
    """공통 리스트 영역 생성 헬퍼 함수"""
    text_widget = ft.TextField(
        multiline=True,
        expand=True,
        read_only=True,
        text_size=12,
        text_style=ft.TextStyle(font_family="Consolas"),
        content_padding=10
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