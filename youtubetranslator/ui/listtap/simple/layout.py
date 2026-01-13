import flet as ft
from youtubetranslator.ui import factory as f 

def setup_simple_layout(self):
    """SimpleTab의 레이아웃을 구성하며, 버튼 객체를 self에 바인딩합니다."""
    main_row = ft.Row(
        expand=True, 
        spacing=8, 
        vertical_alignment=ft.CrossAxisAlignment.STRETCH
    )

    # 1. 원본 데이터
    self.origin_list = f.create_list_field(True)
    self.add_to_queue_btn = f.create_button("리스트 추가", ft.colors.BLUE_700)
    self.clear_queue_btn = f.create_button("큐 초기화", ft.colors.GREY_700)
    
    self.origin_frame = f.add_section(
        " 1. 원본 데이터 ", 
        self.origin_list, 
        [self.add_to_queue_btn, self.clear_queue_btn]
    )

    # 2. 작업 큐
    self.queue_list = f.create_list_field()
    self.queue_start_btn = f.create_button("번역 시작", ft.Colors.GREEN_700)
    self.queue_stop_btn = f.create_button("멈춤", ft.Colors.RED_700)
    
    self.queue_frame = f.add_section(
        " 2. 작업 큐 ", 
        self.queue_list, 
        [self.queue_start_btn, self.queue_stop_btn]
    )

    # 3. 진행 상태 (하단 함수 호출)
    status_content, self.process_labels = _create_status_labels()
    self.status_stop_btn = f.create_button("멈춤", ft.Colors.RED_700)
    self.status_frame = f.add_section(" 3. 진행 상태 ", status_content, [self.status_stop_btn])

    # 4. 최종 결과
    self.result_list = f.create_list_field(True)
    self.move_file_btn = f.create_button("파일 복사", ft.Colors.PURPLE_700)
    
    self.result_frame = f.add_section(
        " 4. 최종 결과 ", 
        self.result_list, 
        [self.move_file_btn]
    )

    main_row.controls.extend([self.origin_frame, self.queue_frame, self.status_frame, self.result_frame])
    self.controls = [main_row]

def _create_status_labels():
    """진행 상태를 나타내는 레이블(Container)들을 생성합니다."""
    steps = ["원본 분리 중", "번역 진행 중", "파트 합치는 중", "최종 결합 중", "모든 공정 완료"]
    labels = []
    container_col = ft.Column(spacing=5, expand=True)
    
    for step in steps:
        lbl = ft.Container(
            content=ft.Text(f"• {step}", size=14, color=ft.Colors.GREY_400),
            padding=ft.padding.all(8),
            border_radius=5,
        )
        container_col.controls.append(lbl)
        labels.append(lbl)
        
    return container_col, labels