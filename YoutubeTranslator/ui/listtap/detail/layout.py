import flet as ft

def setup_detail_layout(self):
    """DetailTab의 1~5단계 리스트 영역을 생성합니다."""
    # 전체를 가로로 배치할 Row 생성
    layout_row = ft.Row(
        expand=True,
        spacing=5,
        vertical_alignment=ft.CrossAxisAlignment.STRETCH # 높이를 꽉 채움
    )

    # 1. 원본
    self.origin_list = create_list_area(layout_row, " 1. 원본 ", "▼ 분리 실행", ft.colors.GREEN_700)
    # 2. 스플릿
    self.split_list = create_list_area(layout_row, " 2. 스플릿 ", "▶ 번역 시작", ft.colors.BLUE_700, has_test_btn=True)
    # 3. 번역 목록
    self.translated_list = create_list_area(layout_row, " 3. 번역 ", "▼ 파트 합치기", ft.colors.ORANGE_700)
    # 4. 파일 합치기
    self.combine_list = create_list_area(layout_row, " 4. 합치기 ", "⌛ 타임라인 생성", ft.colors.LIGHT_GREEN_700)
    # 5. 최종 결과
    self.result_list = create_list_area(layout_row, " 5. 결과 ", "최종 확인", ft.colors.PURPLE_700)

    # DetailTab(ft.Column 또는 ft.Container)의 controls에 추가
    self.controls = [layout_row]

def create_list_area(parent_row, title, btn_text, bg_color, has_test_btn=False):
    """공통 리스트 영역(TextField + 버튼) 생성 헬퍼 함수"""
    
    # 리스트 역할을 할 TextField (Tkinter의 Text 대응)
    # read_only=True는 상황에 따라 조절 가능합니다.
    text_widget = ft.TextField(
        multiline=True,
        expand=True,
        text_size=12,
        content_padding=5,
        read_only=True, # 리스트 용도이므로 기본적으로 읽기 전용 설정
        text_style=ft.TextStyle(font_family="Consolas") # 리스트 가독성
    )
    
    # 메인 버튼
    main_btn = ft.ElevatedButton(
        text=btn_text,
        bgcolor=bg_color,
        color=ft.colors.WHITE,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5)),
        expand=True,
        height=50
    )
    
    # 버튼 컨테이너 (Row)
    btn_container = ft.Row(spacing=2)
    btn_container.controls.append(main_btn)
    
    # 테스트 버튼 처리
    if has_test_btn:
        test_btn = ft.ElevatedButton(
            text="테스트",
            bgcolor=ft.colors.GREY_700,
            color=ft.colors.WHITE,
            width=80,
            height=50,
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5)),
        )
        btn_container.controls.append(test_btn)
        # 이벤트를 위해 위젯에 참조 저장
        text_widget.test_btn = test_btn
    
    # 나중에 events.py에서 버튼을 찾아야 하므로 text_widget에 참조를 붙여둡니다.
    text_widget.main_btn = main_btn

    # 개별 섹션 구성 (제목 + 텍스트창 + 버튼)
    section_container = ft.Container(
        expand=True,
        border=ft.border.all(1, ft.colors.OUTLINE),
        border_radius=8,
        padding=10,
        content=ft.Column([
            ft.Text(title, weight=ft.FontWeight.BOLD),
            text_widget,
            btn_container
        ], spacing=10)
    )

    # 부모 Row에 추가
    parent_row.controls.append(section_container)
    
    return text_widget