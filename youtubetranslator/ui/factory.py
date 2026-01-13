import os
import flet as ft

# Compatibility: older code may reference `ft.Colors` (capital C),
# while newer flet exposes `ft.colors` (lowercase). Provide a fallback
# so existing code using `ft.Colors` continues to work.
if not hasattr(ft, 'Colors') and hasattr(ft, 'colors'):
    ft.Colors = ft.colors

# --- [1. Style Constants: 디자인 통합 제어 변수] ---
SECTION_BG_COLOR = ft.colors.BLACK
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
        color=ft.colors.WHITE,
        height=height,        
        expand=expand,      
        on_click=on_click,
        style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
    )

class SmartListPanel(ft.Container):
    def __init__(self, selectable=False, **kwargs):
        # 내부 리스트뷰 생성
        self.list_view = ft.ListView(
            expand=True, 
            spacing=0, # ListTile 사용 시 간격을 0으로 해야 깔끔합니다
        )
        
        self.selectable = selectable
        self.selected_item = None

        # 부모 Container 설정 (여기서 bgcolor가 확실히 들어가야 합니다)
        super().__init__(
            content=self.list_view,
            bgcolor=ft.colors.WHITE,             # [복구] 배경색 명시
            border=ft.border.all(1, ft.colors.OUTLINE_VARIANT),
            border_radius=6,
            padding=5,
            expand=True,
            **kwargs
        )

    def add(self, text, color=ft.colors.BLACK, size=12):
        if self.selectable:
            # 선택 모드일 때는 클릭 가능한 ListTile로 포장
            new_control = ft.ListTile(
                title=ft.Text(value=str(text), color=color, size=size),
                data=text,
                on_click=self._handle_click,
                bgcolor=ft.colors.TRANSPARENT,
                selected_tile_color=ft.colors.BLUE_200,
                visual_density=ft.ThemeVisualDensity.COMPACT,
            )
        else:
            # 로그 모드일 때는 기존처럼 단순 Text
            new_control = ft.Text(value=str(text), color=color, size=size, selectable=True)

        self.list_view.controls.append(new_control)
        self.list_view.update()

    def _handle_click(self, e):
        # 1. 모든 항목 선택 해제
        for control in self.list_view.controls:
            if isinstance(control, ft.ListTile):
                control.selected = False
        
        # 2. 클릭된 항목만 강조 및 저장
        e.control.selected = True
        self.selected_item = e.control.data
        self.list_view.update()

    def set_list(self, items, color=ft.colors.BLACK, size=12):
        """기존 내용을 모두 지우고 새로운 리스트로 교체합니다. 업데이트는 마지막에 한 번만 수행합니다."""
        # 1. 화면 갱신 없이 내부 리스트만 비움
        self.list_view.controls.clear()
        
        # 2. 새로운 아이템들을 리스트에 추가
        if items:
            for text in items:
                self.add(text)
        
        # 3. 비우고 채우기가 끝난 시점에 딱 한 번만 화면 갱신
        self.list_view.update()

    def clear(self):
        """내부 리스트뷰 비우기"""
        self.list_view.controls.clear()
        self.list_view.update()

    def replace_last(self, text, color=ft.colors.BLACK, size=12):
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
    def get_selected(self):
        """현재 선택된 객체(data)를 리턴합니다."""
        return self.selected_item
    def on_delete_click(e):
        #selected_obj = video_panel.get_selected()
        #if selected_obj:
        #   print(f"선택된 객체 삭제: {selected_obj.title}")
        #else:
        #    print("선택된 항목이 없습니다.")
        pass

    def set_list_folder(self, folders, directory):
        """폴더와 파일 목록을 하나의 문자열로 합쳐서 '단 하나의 개체'로 생성합니다."""
        self.list_view.controls.clear()
    
        if not folders:
            self.list_view.update()
            return

        for folder in folders:
            # 1. 이 폴더 묶음을 대표할 전체 텍스트 조립 시작
            display_text = f"📁 {folder}"
            full_folder_path = os.path.join(directory, folder)
        
            if os.path.exists(full_folder_path):
                files = sorted([f for f in os.listdir(full_folder_path) if f.lower().endswith('.txt')])
            
                for f in files:
                    # 파일명 슬라이싱
                    if "_Part" in f:
                        display_part = f[f.find("Part"):]
                        line = f"   └─ {display_part}"
                    else:
                        line = f"   └─ {f}"
                
                    # 2. 줄바꿈(\n)을 넣어 하나의 긴 텍스트로 만듦
                    display_text += f"\n{line}"
        
            # 3. [핵심] 폴더와 파일 목록이 합쳐진 이 '거대 텍스트'로 개체 생성
            # 이렇게 하면 파일 부분을 눌러도 결국 'folder' 데이터가 반환됩니다.
            self._add_tree_item(display_text, folder, is_child=False)
        
            # 각 폴더(개체) 사이의 구분선
            self.list_view.controls.append(ft.Divider(height=1, color=ft.colors.OUTLINE_VARIANT))

        self.list_view.update()

    def _add_tree_item(self, text, folder_name, is_child=False):
        """트리 항목을 생성하여 추가합니다. 클릭 시 데이터는 항상 '부모 폴더명'을 가집니다."""
        # 자식 파일인 경우 글자색을 약간 연하게, 크기를 작게 설정하여 계층감 표현
        text_color = ft.colors.BLACK54 if is_child else ft.colors.BLACK
        text_size = 11 if is_child else 12

        if self.selectable:
            # 선택 모드일 때는 클릭 가능한 ListTile로 생성
            new_control = ft.ListTile(
                title=ft.Text(value=text, color=text_color, size=text_size),
                data=folder_name,  # [핵심] 자식을 눌러도 부모 폴더명이 반환됨
                on_click=self._handle_click,
                bgcolor=ft.colors.TRANSPARENT,
                selected_tile_color=ft.colors.BLUE_50,
                visual_density=ft.ThemeVisualDensity.COMPACT,
            )
        else:
            # 로그 모드일 때는 단순 Text
            new_control = ft.Text(value=text, color=text_color, size=text_size, selectable=True)

        self.list_view.controls.append(new_control)

# --- [Factory Function] ---
def create_list_field(selectable = False):
    """
    이제 하얀 박스 그 자체이면서 .add() 기능을 가진 
    SmartListPanel 객체 하나만 리턴합니다.
    """
    return SmartListPanel(selectable)

def create_section_container(content, expand=True):
    """회색 배경의 내용물 박스 생성"""
    return ft.Container(
        expand=expand,
        bgcolor=ft.colors.with_opacity(SECTION_BG_OPACITY, SECTION_BG_COLOR), 
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


