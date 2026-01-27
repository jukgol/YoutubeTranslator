import flet as ft
from .layout import Layout
from .handle_rule import on_rule_save # 새로 생성된 핸들러 임포트
from app.setting_service import setting_service # setting_service 임포트

class Component:
    """
    Rule 탭의 하위 UI 컴포넌트들을 생성하고 관리하는 중앙 클래스.
    UI의 실제 레이아웃(배치)은 Layout 클래스에서 처리합니다.
    """
    def __init__(self):
        self.ui = Layout()
        self._setup_handlers()
        self.load() # 초기 데이터 로드

    def _setup_handlers(self):
        """이벤트 핸들러를 UI 컨트롤에 직접 연결합니다."""
        # 규칙 입력 필드에서 포커스를 잃을 때 (on_blur)
        self.ui.rule_input.widget.on_blur = lambda e: on_rule_save(self.ui.rule_input.widget, e)

    def set_rule(self, rule):
        self.ui.rule_text.value = rule

    def load(self):
        """컴포넌트 초기 로드 시 설정 데이터를 불러와 UI에 반영합니다."""
        rule = setting_service.load_rule()
        self.set_rule(rule)
