import flet as ft
from .components import LabeledInput

class RuleArea(ft.Column):
    def __init__(self, save_cmd):
        super().__init__()
        
        # 1. LabeledInput 생성
        self.rule_input = LabeledInput(
            label_text="번역 지침(Rule):", 
            is_multiline=True, 
            save_cmd=save_cmd
        )
        
        # 2. 내부 위젯 분리 및 설정
        label = self.rule_input.controls[0]      # 라벨 추출
        self.rule_text = self.rule_input.widget    # TextField 추출

        # --- 핵심: 테두리와 스크롤 분리 ---
        # A. TextField 자체의 테두리는 없앱니다 (움직이면 안 되니까요).
        self.rule_text.border = ft.InputBorder.NONE
        self.rule_text.expand = True
        
        # B. 고정될 테두리 역할을 하는 '그릇'을 만듭니다.
        self.fixed_frame = ft.Container(
            content=ft.Column(
                controls=[self.rule_text],
                scroll=ft.ScrollMode.ALWAYS,    # 스크롤바 항상 표시
            ),
            border=ft.border.all(1, ft.Colors.OUTLINE), # 이 테두리는 고정됩니다.
            border_radius=5,
            height=150,  # 영역 전체의 높이 고정
            expand=True,
            padding=5    # 테두리와 텍스트 사이 간격
        )

        # 3. 레이아웃 재구성 (라벨은 고정, 프레임만 우측에 배치)
        self.controls = [
            ft.Row(
                controls=[
                    label,              # 왼쪽 라벨 (고정)
                    self.fixed_frame     # 오른쪽 고정 테두리 박스 (내부만 스크롤)
                ],
                vertical_alignment=ft.CrossAxisAlignment.START
            )
        ]