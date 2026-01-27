import flet as ft
from .layout import Layout
from app.setting_service import setting_service # setting_service 임포트
from .handle_version import on_version_save # 새로 생성된 핸들러 임포트

class Component:
    """
    Version 탭의 하위 UI 컴포넌트들을 생성하고 관리하는 중앙 클래스.
    UI의 실제 레이아웃(배치)은 Layout 클래스에서 처리합니다.
    """
    def __init__(self):
        self.ui = Layout()
        self._setup_handlers()
        self.load() # 초기 데이터 로드

    def _setup_handlers(self):
        """이벤트 핸들러를 UI 컨트롤에 직접 연결합니다."""
        # 버전 입력 필드에서 포커스를 잃을 때 (on_blur)
        self.ui.ver_input.widget.on_blur = lambda e: on_version_save(self.ui.ver_input.widget, e)
        
        # '남은 요청 확인' 버튼을 클릭할 때 - on_check_usage 함수 제거됨
        # self.ui.check_btn.on_click = lambda e: on_check_usage(self.ui.remaining_label, self.ui.ver_input.widget, e)
        print("✅ [VersionComponent] '남은 요청 확인' 버튼 핸들러 연결 로직은 on_check_usage 함수 제거로 인해 주석 처리됨.")

    def set_version(self, version):
        self.ui.ver_entry.value = version 
        # self.ui.ver_entry.update() # update() 호출은 하지 않음

    def load(self):
        """컴포넌트 초기 로드 시 설정 데이터를 불러와 UI에 반영합니다."""
        version = setting_service.load_version()
        self.set_version(version)
