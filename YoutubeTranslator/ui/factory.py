import flet as ft

# --- [1. Style Constants: 디자인 통합 제어 변수] ---
SECTION_BG_COLOR = ft.Colors.BLACK
SECTION_BG_OPACITY = 0.05
SECTION_RADIUS = 10
SECTION_PADDING = 10

TITLE_SIZE = 13
TITLE_WEIGHT = ft.FontWeight.BOLD
TITLE_PADDING = ft.padding.only(left=5, bottom=2)

LAYOUT_SPACING = 8    # 섹션 전체 (제목 - 박스 - 버튼) 간격
INNER_SPACING = 10     # 회색 박스 내부 위젯들 간격
BTN_SPACING = 2       # 하단 버튼들 사이 간격

# --- [2. Low-Level Components: 개별 부품 생성] ---

def create_button(text, color, icon=None, expand=True, height=50, on_click=None):
    """표준 규격 버튼 생성"""
    return ft.ElevatedButton(
        text=text,
        icon=icon,
        bgcolor=color,
        color=ft.Colors.WHITE,
        height=height,        
        expand=expand,      
        on_click=on_click,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
    )

def create_list_field():
    """
    [완성형 디자인]
    흰색 컨테이너(배경/테두리 담당) 안에 투명 텍스트 필드(입력 담당)를 넣는 구조
    """
    
    # 1. 투명한 텍스트 필드 (기능 담당)
    text_widget = ft.TextField(
        multiline=True,
        expand=True,
        text_size=12,
        content_padding=10, # 글자가 박스 벽에 너무 붙지 않게 여백
        
        # 완전 투명 설정
        bgcolor=ft.Colors.TRANSPARENT,
        focused_bgcolor=ft.Colors.TRANSPARENT,
        border=ft.InputBorder.NONE,
        focused_border_width=0,
        filled=False,
        
        text_style=ft.TextStyle(font_family="Consolas"),
        cursor_color=ft.Colors.BLACK,
    )

    # 2. 흰색 컨테이너 (디자인 담당)
    # 이 녀석이 실제 우리 눈에 보이는 '하얀 리스트 박스'가 됩니다.
    list_container = ft.Container(
        content=text_widget,  # 투명 텍스트 필드를 안에 넣음
        
        expand=True,          # 공간 채우기
        bgcolor=ft.Colors.WHITE, # 여기가 진짜 배경색 (변하지 않음)
        
        # 테두리 설정 (클릭해도 색 안 변함)
        border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT),
        border_radius=ft.border_radius.all(6), # 모서리 둥글게
    )

    return list_container

def create_section_container(content, expand=True):
    """회색 배경의 내용물 박스 생성"""
    return ft.Container(
        expand=expand,
        bgcolor=ft.Colors.with_opacity(SECTION_BG_OPACITY, SECTION_BG_COLOR), 
        border_radius=SECTION_RADIUS,
        padding=SECTION_PADDING,
        content=content
    )

# --- [3. Internal Helper: 최종 조립 규격화] ---

def _assemble_section(title_label, section_box, btn_row):
    """
    모든 섹션의 최종 포장 규격(Column)을 결정합니다.
    디자인 수정 시 이 함수만 고치면 모든 탭의 섹션 정렬이 바뀝니다.
    """
    return ft.Column(
        controls=[title_label, section_box, btn_row],
        spacing=LAYOUT_SPACING,
        expand=True,
        horizontal_alignment=ft.CrossAxisAlignment.STRETCH
    )

# --- [4. Public API: 실제 섹션 생성 함수] ---
def add_section(title, content_widget, buttons):
    title_label = ft.Container(
        content=ft.Text(title, weight=TITLE_WEIGHT, size=TITLE_SIZE),
        padding=TITLE_PADDING
    )
    
    # [수정] 하얀 박스(content_widget)를 Column으로 감싸고 
    # 그 Column에게 "박스 끝까지 늘어나라"고 명령(expand=True)합니다.
    inner_column = ft.Column(
        controls=[content_widget],
        expand=True,  # 이 명령이 있어야 하얀 박스가 회색 박스 바닥까지 내려갑니다.
        spacing=0
    )
    
    # 회색 박스도 부모로부터 높이를 받아오도록 expand=True를 줍니다.
    section_box = create_section_container(inner_column, expand=True)
    
    btn_row = ft.Row(buttons, spacing=BTN_SPACING)
    
    return _assemble_section(title_label, section_box, btn_row)

def add_input_section(title, input_widget, content_widget, buttons):
    """
    [확장형 섹션]
    구조: 제목(밖) -> 회색박스(입력창 + 내용물) -> 버튼(밖)
    """
    title_label = ft.Container(
        content=ft.Text(title, weight=TITLE_WEIGHT, size=TITLE_SIZE),
        padding=TITLE_PADDING
    )

    # 박스 내부에 입력창과 메인 내용을 세로로 배치
    inner_content = ft.Column(
        controls=[input_widget, content_widget],
        spacing=INNER_SPACING,
        expand=True
    )
    
    section_box = create_section_container(inner_content)
    btn_row = ft.Row(buttons, spacing=BTN_SPACING)

    return _assemble_section(title_label, section_box, btn_row)