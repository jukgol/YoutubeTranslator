from .api.component import ApiComponent
from .rule.component import Component as RuleComponent
from .version.component import Component as VersionComponent
from .layout import ConfigLayout

class Component:
    """
    Config 탭의 모든 하위 UI 컴포넌트들을 생성하고 관리하는 중앙 클래스.
    UI의 실제 레이아웃(배치)은 Layout 클래스에서 처리합니다.
    """
    def __init__(self):
        # 1. 하위 컴포넌트들 선언 및 생성
        self.api = ApiComponent()
        self.rule = RuleComponent()
        self.version = VersionComponent()
        
        # 2. 자신의 인스턴스(self)를 Layout 클래스에 넘겨주어 UI를 구성하게 함
        self.ui = ConfigLayout(self)
