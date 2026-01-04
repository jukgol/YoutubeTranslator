import flet as ft
# 기존 모듈 임포트 (Flet 버전으로 수정되었다고 가정)
#from .bridge import register_log_bridge
from .print_text import PrintText

class LogSection(ft.Column):
    def __init__(self, handler):
        # Flet은 parent를 인자로 넘기지 않습니다.
        super().__init__()
        self.handler = handler
        self.spacing = 10  # 위젯 간 간격

        # 1. 위젯 생성
        self.setup_widgets()
        
        # 2. Printer 생성 (Flet용으로 수정된 PrintText에 TextField 전달)
        self.printer = PrintText(self.log_text)
        
        # 3. 핸들러와 연결 (bridge.py)
        #register_log_bridge(self)

    def setup_widgets(self):
        """Tkinter의 LabelFrame과 Text+Scrollbar 구조를 Flet으로 재구성"""
        
        # 로그 출력창 (Tkinter의 Text 위젯 대응)
        self.log_text = ft.TextField(
            multiline=True,
            read_only=True,      # state=tk.DISABLED 대응
            min_lines=8,         # height=8 대응
            max_lines=8,
            expand=True,
            bgcolor=ft.Colors.with_opacity(0.05, ft.Colors.ON_SURFACE), # #f8f8f8 느낌
            text_size=12,
            text_style=ft.TextStyle(font_family="Consolas"), # 로그용 고정폭 글꼴
            content_padding=10,
        )

        # 버튼 생성
        self.refresh_btn = ft.ElevatedButton(
            text="🔄 목록 새로고침",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
        )
        self.clear_log_btn = ft.ElevatedButton(
            text="🗑️ 로그 초기화",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=5))
        )

        # 버튼들을 담을 가로 Row (Tkinter의 btn_frame 대응)
        btn_row = ft.Row(
            controls=[self.refresh_btn, self.clear_log_btn],
            alignment=ft.MainAxisAlignment.CENTER,
            spacing=10
        )

        # 전체 레이아웃 구성 (LabelFrame 시각적 구현)
        self.controls = [
            ft.Text(" 작업 로그 ", weight=ft.FontWeight.BOLD), # LabelFrame의 text 대응
            ft.Container(
                content=ft.Column([
                    self.log_text,
                    btn_row
                ], spacing=10),
                border=ft.border.all(1, ft.Colors.OUTLINE), # 테두리
                border_radius=8,
                padding=10,
            )
        ]