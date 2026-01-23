import flet as ft
from ..helper_layout import LabeledInput

class Layout(ft.Row):
    def __init__(self):
        super().__init__()
        self.vertical_alignment = ft.CrossAxisAlignment.CENTER # 수직 중앙 정렬

        # 1. 버전 입력창 (LabeledInput 활용)
        # expand=True를 주어 가로 공간을 최대한 차지하게 합니다.
        self.ver_input = LabeledInput(
            label_text="Gemini Version:", 
        )
        self.ver_input.expand = True 
        
        # 외부 참조용 변수 유지
        self.ver_entry = self.ver_input.widget
        
        # 2. 버튼 (ElevatedButton)
        self.check_btn = ft.ElevatedButton(
            text="남은 요청 확인",
            style=ft.ButtonStyle(
                shape=ft.RoundedRectangleBorder(radius=5),
                padding=ft.padding.all(10),
            )
        )
        
        # 3. 레이블 (Text)
        self.remaining_label = ft.Text(
            value="확인 전",
            color=ft.Colors.BLUE,
            size=12
        )

        # 4. 전체 배치 (Row의 controls)
        self.controls = [
            self.ver_input,
            self.check_btn,
            self.remaining_label
        ]