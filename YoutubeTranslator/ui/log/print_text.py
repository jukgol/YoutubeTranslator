import tkinter as tk

class PrintText:
    def __init__(self, log_widget):
        self.log_text = log_widget

    def render(self, data):
        """데이터 패킷의 타입에 따라 적절한 출력 로직 실행"""
        if not self.log_text:
            return

        # 1. 분기 로직 (Executor에서 이동됨)
        if data.get("type") == "clear":
            self._clear_widget()
        else:
            self._print_to_widget(data)

    def _clear_widget(self):
        """위젯 전체 삭제"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete("1.0", tk.END)
        self.log_text.config(state=tk.DISABLED)

    def _print_to_widget(self, data):
        """정밀한 출력 로직 (줄 꼬임 방지)"""
        msg = data.get("msg", "")
        replace = data.get("replace", False)

        self.log_text.config(state=tk.NORMAL)
        try:
            if replace:
                # 1. 마지막 줄 교체 (정확히 한 줄만 타격)
                # end-1c는 마지막 자동 줄바꿈 직전 위치입니다.
                last_line_idx = self.log_text.index("end-1c linestart")
                self.log_text.delete(last_line_idx, "end-1c")
                self.log_text.insert("end-1c", msg)
            else:
                # 2. 새 줄 추가 (내용이 하나라도 있으면 무조건 줄바꿈)
                # "1.0"에서 "end-1c"까지의 길이가 0보다 크면 내용이 있는 것임
                current_content = self.log_text.get("1.0", "end-1c")
                if len(current_content) > 0:
                    self.log_text.insert(tk.END, f"\n{msg}")
                else:
                    self.log_text.insert(tk.END, msg)
            
            # 항상 최하단으로 스크롤
            self.log_text.see(tk.END)
        finally:
            self.log_text.config(state=tk.DISABLED)