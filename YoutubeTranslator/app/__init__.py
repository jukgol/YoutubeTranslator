import tkinter as tk
import os

# 사용자 정의 모듈 (프로젝트 경로에 맞게 확인 필요)
from .path import paths
from .config import AppConfig
from handler import UIHandlers
from .logexcutor import LogExecutor

class SubtitleSplitterApp:
    def __init__(self, root):
        self.root = root
        
        # 1. UI 기본 설정
        self.root.title("Gemini 자막 매니저 v1.1")
        self.root.geometry("1400x800")

        # 2. 로그 실행기(Executor) 생성        
        self.log_executor = LogExecutor(self.root)

        # 3. 데이터 및 경로 관리자 생성
        self.path = paths
        self.configdata = AppConfig()

        # 4. 중앙 핸들러(UIHandlers) 생성        
        self.handlers = UIHandlers(
            self, 
            self.path, 
            self.configdata, 
            self.log_executor.get_queue()
        )
        
        # 5. UI 구성 (섹션 배치 및 위젯 생성)        
        self.setup_ui()
        
        if hasattr(self, 'log_sec') and self.log_sec.printer:            
            self.log_executor.start_executor(self.log_sec.printer)

        # 7. 프로그램 시작 시 초기 작업 실행
        self.handlers.load_settings()      # 기존 설정 불러오기
        self.handlers.refresh_all_lists()  # 파일 목록 새로고침

    def setup_ui(self):
        """외부 ui.py의 compose_ui 함수를 호출하여 화면을 조립합니다."""
        from ui import compose_ui
        compose_ui(self)
