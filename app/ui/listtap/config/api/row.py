import flet as ft

class ApiManagementRow(ft.Row):
    """복잡한 API 선택/삭제/추가 로직이 모인 전용 컴포넌트"""
    def __init__(self):
        super().__init__()
        self.vertical_alignment = ft.CrossAxisAlignment.CENTER

        # 1. 선택 영역 (Combobox -> Dropdown)
        self.combo = ft.Dropdown(
            expand=True,
            content_padding=ft.padding.only(left=10),
        )
        self.combo.height = 40

        # 2. 삭제 버튼
        self.delete_btn = ft.ElevatedButton(
            "선택 삭제",
            bgcolor=ft.Colors.RED_400,
            color=ft.Colors.WHITE,
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