import flet as ft
from .layout import LogPanel
from .printer import PrintText
import app.log as log

class LogSection(ft.Column):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.height = 250
        
        # 1. 실제 로그가 표시될 패널
        self.log_panel = LogPanel(expand=True)
        
        # 2. 로그 패널에 텍스트를 출력하는 역할을 할 프린터
        self.printer = PrintText(self.log_panel)
        
        # 3. UI 구성
        self.controls = [
            ft.Row(
                controls=[
                    ft.Text("Log", weight=ft.FontWeight.BOLD),
                    ft.IconButton(
                        icon=ft.icons.CLEAR,
                        tooltip="Clear logs",
                        on_click=self.handle_clear_logs,
                    ),
                ]
            ),
            self.log_panel,
        ]
        


    def handle_clear_logs(self, e):
        log.clear()


def create_section(*args, **kwargs) -> LogSection:
    """LogSection 인스턴스를 생성하여 반환하는 팩토리 함수"""
    print("▶️ [Section] 생성 함수 호출됨")
    return LogSection(*args, **kwargs)
