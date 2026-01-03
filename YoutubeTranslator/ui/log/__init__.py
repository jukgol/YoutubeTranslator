import tkinter as tk
from .bridge import register_log_bridge
from .print_text import PrintText

class LogSection(tk.LabelFrame):
    def __init__(self, parent, handler): # refresh_cmd 대신 handler를 받음
        super().__init__(parent, text=" 작업 로그 ", padx=5, pady=5)
        self.handler = handler
        
        # 1. 위젯 생성
        self.setup_widgets()
        self.printer = PrintText(self.log_text)
        # 2. 핸들러와 연결 (인터페이스 초기화 포함)
        register_log_bridge(self)

    def setup_widgets(self):
        # 기존 코드와 동일
        log_frame = tk.Frame(self)
        log_frame.pack(fill=tk.BOTH, expand=True)

        scrollbar = tk.Scrollbar(log_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # 핸들러가 제어할 수 있도록 self.log_text로 유지
        self.log_text = tk.Text(log_frame, height=8, state=tk.DISABLED, 
                                bg="#f8f8f8", yscrollcommand=scrollbar.set)
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.log_text.yview)

        btn_frame = tk.Frame(self)
        btn_frame.pack(pady=5)

        self.refresh_btn = tk.Button(btn_frame, text="🔄 목록 새로고침")
        self.refresh_btn.pack(side=tk.LEFT, padx=5)

        self.clear_log_btn = tk.Button(btn_frame, text="🗑️ 로그 초기화")
        self.clear_log_btn.pack(side=tk.LEFT, padx=5)