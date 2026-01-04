import flet as ft

from .print_text import PrintText
from .panel import LogPanel

class LogSection(ft.Column):
    def __init__(self):
        # Flet은 parent를 인자로 넘기지 않습니다.
        super().__init__()
        self.spacing = 10  # 위젯 간 간격

        # 1. 위젯 생성
        self.setup_widgets()
        
        # 2. Printer 생성 (Flet용으로 수정된 PrintText에 TextField 전달)
        self.printer = PrintText(self.log_text)

    # LogSection 클래스의 setup_widgets 메서드 부분
    def setup_widgets(self):
        # 기존 ft.TextField를 제거하고 factory의 SmartListPanel을 사용합니다.
        # create_list_field()는 SmartListPanel 객체를 반환합니다.
        self.log_text = LogPanel() 
    
        # 높이 제한이 필요하다면 여기서 height를 지정할 수 있습니다.
        self.log_text.height = 200 

        self.refresh_btn = ft.ElevatedButton(
            text="🔄 목록 새로고침",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
        )
        self.clear_log_btn = ft.ElevatedButton(
            text="🗑️ 로그 초기화",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
        )

        btn_row = ft.Row(
            controls=[self.refresh_btn, self.clear_log_btn],
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=10
        )

        self.controls = [
            ft.Text(" 작업 로그 ", weight=ft.FontWeight.BOLD),
            ft.Container(
                content=ft.Column([
                    self.log_text, # 이제 ListView가 담긴 SmartListPanel입니다.
                    btn_row
                ], spacing=10),
                border=ft.border.all(1, ft.Colors.OUTLINE),
                border_radius=8,
                padding=10,
            )
        ]