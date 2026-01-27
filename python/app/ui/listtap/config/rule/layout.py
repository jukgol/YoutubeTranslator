import flet as ft
from ..helper_layout import LabeledInput

class Layout(ft.Column):
    def __init__(self):
        super().__init__()
        self.expand = True # 세로로 남은 공간을 모두 차지함
        # 1. LabeledInput 생성 (parent 인자 제거, 1:1 대응)
        self.rule_input = LabeledInput(
            label_text="번역 지침(Rule):", 
            is_multiline=True,
        )
        
       # 핵심: 고정 높이를 지우고 expand만 남깁니다.
        self.rule_input.expand = True 
        self.rule_input.widget.expand = True
        
        # 2. 레이아웃 배치
        self.controls = [self.rule_input]
        
        # 3. 외부(handler)에서 접근할 위젯 노출
        # LabeledInput 내부의 ft.TextField 객체를 가리킵니다.
        self.rule_text = self.rule_input.widget