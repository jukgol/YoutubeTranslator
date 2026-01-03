import flet as ft
from .components import LabeledInput

class RuleArea(ft.Column):
    def __init__(self, save_cmd):
        super().__init__()
        
        # 1. LabeledInput 생성 (parent 인자 제거, 1:1 대응)
        self.rule_input = LabeledInput(
            label_text="번역 지침(Rule):", 
            is_multiline=True, 
            save_cmd=save_cmd
        )
        
        # 2. 레이아웃 배치
        self.controls = [self.rule_input]
        
        # 3. 외부(handler)에서 접근할 위젯 노출
        # LabeledInput 내부의 ft.TextField 객체를 가리킵니다.
        self.rule_text = self.rule_input.widget