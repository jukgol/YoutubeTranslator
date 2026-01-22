import flet as ft
import os

# 사용자 정의 모듈 (기존 로직은 그대로 유지)
from .path import paths
from .config import AppConfig
import app.log as log
from .ui.listtap import ListTabContainer

class SubtitleSplitterApp:
    def __init__(self, page: ft.Page):
        self.page = page
    
    # UI 기본 설정
        self.page.title = "Gemini 자막 매니저 v1.1"

        # 1~3. 창 크기/최소값/여백 설정
        # flet의 버전에 따라 Page.window가 없을 수 있으므로 안전하게 처리합니다.
        if hasattr(self.page, "window"):
            try:
                self.page.window.width = 1400
                self.page.window.height = 1000
                self.page.window.min_width = 1200
                self.page.window.min_height = 600
                self.page.window.center()
            except Exception as e:
                print(f"[startup] Warning: failed to configure page.window: {e}")
        else:
            # 구버전 flet에서는 window 속성이 없으므로 최소한의 대체 동작
            # (padding과 중앙 정렬만 설정해둡니다)
            pass

        # 4. 여백 제거 (창 끝까지 사용)
        self.page.padding = 10

        # 3. 로그 시스템 초기화 (새로운 방식)
        log.init_log_components(self.page) # 기존 LogExecutor 생성 및 시작 로직 대체

        # 4. 데이터 및 경로 관리자 생성
        self.path = paths
        self.configdata = AppConfig()

        self.setup_ui()

        # 5. 중앙 핸들러(UIHandlers) 생성
        from .handler import UIHandlers
        self.handlers = UIHandlers(
            self, 
            self.path, 
            self.configdata
        )
        
        self._register_ui_to_handlers()
        


        # 8. 초기 작업 실행        
        self.handlers.init_settings()        

    def setup_ui(self):
        """외부 ui.py의 compose_ui 함수를 호출하여 화면을 조립합니다."""
        # 이 시점에 self.page.controls에 위젯들이 추가됩니다.
        from .ui import compose_ui
        self.list_tabs = ListTabContainer()
        self.log_sec = log.get_section_ui() # LogSection 생성을 새로운 방식으로 대체
        compose_ui(self)

    def _register_ui_to_handlers(self):
        """UI 객체들과 핸들러 로직을 최종적으로 연결하는 마스터 배선함"""
        # ListTabContainer 내부의 모든 탭(Simple, Detail, Download, Config) 배선 가동
        if hasattr(self, 'list_tabs'):
            self.list_tabs.setup_handler(self.handlers)

        self.log_sec.setup_handler(self.handlers)