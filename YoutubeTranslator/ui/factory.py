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

class SmartListPanel(ft.Container):
    """
    [통합형] 하얀 박스 디자인 + 리스트 추가 기능을 하나로 합친 위젯
    """
    def __init__(self, **kwargs):
        # 내부에서 실제로 글자가 쌓일 리스트뷰
        self.list_view = ft.ListView(
            expand=True,
            spacing=5,            
        )
        
        # 부모인 Container(하얀 박스) 설정
        super().__init__(
            content=self.list_view,
            bgcolor=ft.Colors.WHITE,              # 내부 흰색
            border=ft.border.all(1, ft.Colors.OUTLINE_VARIANT), # 회색 테두리
            border_radius=6,                      # 둥근 모서리
            padding=5,
            expand=True,
            **kwargs
        )

    def add(self, text, color=ft.Colors.BLACK, size=12):
        """내부 리스트뷰에 텍스트 추가"""
        self.list_view.controls.append(
            ft.Text(
                value=str(text),
                color=color,
                size=size,
                no_wrap=False,
                selectable=True
            )
        )
        self.list_view.update()

    def set_list(self, items, color=ft.Colors.BLACK, size=12):
        """기존 내용을 모두 지우고 새로운 리스트로 교체합니다. 업데이트는 마지막에 한 번만 수행합니다."""
        # 1. 화면 갱신 없이 내부 리스트만 비움
        self.list_view.controls.clear()
        
        # 2. 새로운 아이템들을 리스트에 추가
        if items:
            for text in items:
                self.list_view.controls.append(
                    ft.Text(
                        value=str(text),
                        color=color,
                        size=size,
                        no_wrap=False,
                        selectable=True
                    )
                )
        
        # 3. 비우고 채우기가 끝난 시점에 딱 한 번만 화면 갱신
        self.list_view.update()

    def clear(self):
        """내부 리스트뷰 비우기"""
        self.list_view.controls.clear()
        self.list_view.update()

    def replace_last(self, text, color=ft.Colors.BLACK, size=12):
        """마지막 줄의 내용만 변경합니다. (주로 진행률 표시 등에 사용)"""
        if self.list_view.controls:
            # 마지막 Text 위젯의 값만 변경
            last_control = self.list_view.controls[-1]
            last_control.value = str(text)
            last_control.color = color
            last_control.size = size
            self.list_view.update()
        else:
            # 리스트가 비어있다면 새로 추가
            self.add(text, color, size)

# --- [Factory Function] ---

def create_list_field():
    """
    이제 하얀 박스 그 자체이면서 .add() 기능을 가진 
    SmartListPanel 객체 하나만 리턴합니다.
    """
    return SmartListPanel()

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