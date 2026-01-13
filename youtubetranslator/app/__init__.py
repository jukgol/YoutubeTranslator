import flet as ft
import os

# 사용자 정의 모듈 (기존 로직은 그대로 유지)
from ..path import paths
from .config import AppConfig
from handler import UIHandlers
from .logexcutor import LogExecutor
from ui.listtap import ListTabContainer
from ui.log import LogSection

class SubtitleSplitterApp:
    def __init__(self, page: ft.Page):
        self.page = page
    
    # UI 기본 설정
        self.page.title = "Gemini 자막 매니저 v1.1"
    
        # 1. 창 크기 설정
        self.page.window.width = 1400
        self.page.window.height = 1000
    
        # 2. 최소 크기 제한 (이보다 작아지지 않음)
        self.page.window.min_width = 1200
        self.page.window.min_height = 600
    
        # 4. 여백 제거 (창 끝까지 사용)
        self.page.padding = 10 
        
        self.page.window.center()
        # (선택 사항) 실행 시 바로 최대화하고 싶다면 아래 주석 해제
        # self.page.window_maximized = True

        # 3. 로그 실행기(Executor) 생성 (기존에 수정한 Flet용 LogExecutor)
        # 이제 root 대신 page를 넘깁니다.
        self.log_executor = LogExecutor(self.page)

        # 4. 데이터 및 경로 관리자 생성
        self.path = paths
        self.configdata = AppConfig()

        self.setup_ui()

        # 5. 중앙 핸들러(UIHandlers) 생성
        self.handlers = UIHandlers(
            self, 
            self.path, 
            self.configdata, 
            self.log_executor.get_queue()
        )
        
        self._register_ui_to_handlers()
        
    # SubtitleSplitterApp 클래스 내부 (Step 7)
        if hasattr(self, 'log_sec') and self.log_sec.printer:
    # 내부에서 알아서 run_task를 하므로, 여기서는 그냥 실행만 명령합니다.
            self.log_executor.start(self.log_sec.printer)

        # 8. 초기 작업 실행        
        self.handlers.init_settings()        

    def setup_ui(self):
        """외부 ui.py의 compose_ui 함수를 호출하여 화면을 조립합니다."""
        # 이 시점에 self.page.controls에 위젯들이 추가됩니다.
        from ui import compose_ui
        self.list_tabs = ListTabContainer()
        self.log_sec = LogSection()
        compose_ui(self)

    def _register_ui_to_handlers(self):
        """UI 객체들과 핸들러 로직을 최종적으로 연결하는 마스터 배선함"""
        # ListTabContainer 내부의 모든 탭(Simple, Detail, Download, Config) 배선 가동
        if hasattr(self, 'list_tabs'):
            self.list_tabs.setup_handler(self.handlers)

        self.log_sec.setup_handler(self.handlers)