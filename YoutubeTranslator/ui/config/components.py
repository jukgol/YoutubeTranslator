import flet as ft

class LabeledInput(ft.Row):
    """라벨과 입력창(TextField)이 결합된 기본 단위"""
    def __init__(self, label_text, is_multiline=False, save_cmd=None):
        super().__init__()
        self.vertical_alignment = ft.CrossAxisAlignment.CENTER # 수직 중앙 정렬
        
        # 1. 위젯 생성
        if is_multiline:
            # Tkinter의 Text(height=4) 대응
            self.widget = ft.TextField(multiline=True, min_lines=4, expand=True)
        else:
            # Tkinter의 Entry 대응
            self.widget = ft.TextField(expand=True, height=40) # 높이를 적절히 조절
            
        # 2. 이벤트 바인딩 (FocusOut -> on_blur)
        if save_cmd:
            self.widget.on_blur = lambda e: save_cmd()

        # 3. 레이아웃 구성
        self.controls = [
            ft.Text(label_text, width=120), # width 15 대응 (픽셀 단위 조정)
            self.widget
        ]

class ApiManagementRow(ft.Row):
    """복잡한 API 선택/삭제/추가 로직이 모인 전용 컴포넌트"""
    def __init__(self, select_cmd, delete_cmd):
        super().__init__()
        self.vertical_alignment = ft.CrossAxisAlignment.CENTER

        # 1. 선택 영역 (Combobox -> Dropdown)
        self.combo = ft.Dropdown(
            expand=True,
            height=40,
            content_padding=ft.padding.only(left=10),
            on_change=lambda e: select_cmd() # 선택 변경 시 실행
        )

        # 2. 삭제 버튼
        self.delete_btn = ft.ElevatedButton(
            "선택 삭제",
            on_click=lambda e: delete_cmd(),
            bgcolor=ft.colors.RED_400,
            color=ft.colors.WHITE,
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5)),
        )

        # 3. 추가 영역 (Entry -> TextField)
        self.entry = ft.TextField(expand=True, height=40)

        # 4. 전체 배치
        self.controls = [
            ft.Text("Gemini API Key 선택:", width=150),
            self.combo,
            self.delete_btn,
            ft.Text("새 Key 추가:", width=100),
            self.entry
        ]