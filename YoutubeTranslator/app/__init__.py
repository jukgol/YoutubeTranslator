import flet as ft
import os

# 사용자 정의 모듈 (기존 로직은 그대로 유지)
from .path import paths
from .config import AppConfig
from handler import UIHandlers
from .logexcutor import LogExecutor

class SubtitleSplitterApp:
    def __init__(self, page: ft.Page):
        self.page = page
    
    # UI 기본 설정
        self.page.title = "Gemini 자막 매니저 v1.1"
    
        # 1. 창 크기 설정
        self.page.window_width = 1400
        self.page.window_height = 800
    
        # 2. 최소 크기 제한 (이보다 작아지지 않음)
        self.page.window_min_width = 1200
        self.page.window_min_height = 600
    
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

        # 5. 중앙 핸들러(UIHandlers) 생성
        self.handlers = UIHandlers(
            self, 
            self.path, 
            self.configdata, 
            self.log_executor.get_queue()
        )
        
        # 6. UI 구성 (섹션 배치 및 위젯 생성)
        self.setup_ui()
        
        # 7. 로그 출력 엔진 시작
        if hasattr(self, 'log_sec') and self.log_sec.printer:            
            self.log_executor.start_executor(self.log_sec.printer)

        # 8. 초기 작업 실행
        self.handlers.load_settings()      # 기존 설정 불러오기
        self.handlers.refresh_all_lists()  # 파일 목록 새로고침
        
        # 9. 모든 변경 사항을 최종적으로 화면에 반영
        self.page.update()

    def setup_ui(self):
        """외부 ui.py의 compose_ui 함수를 호출하여 화면을 조립합니다."""
        # 이 시점에 self.page.controls에 위젯들이 추가됩니다.
        from ui import compose_ui
        compose_ui(self)