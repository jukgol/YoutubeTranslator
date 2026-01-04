import flet as ft

class PrintText:
    def __init__(self, log_widget: ft.TextField):
        # log_widget은 LogSection에서 넘겨받은 ft.TextField 객체입니다.
        self.log_text = log_widget

    def render(self, data):
        """데이터 패킷의 타입에 따라 적절한 출력 로직 실행"""
        if not self.log_text:
            return

        if data.get("type") == "clear":
            self._clear_widget()
        else:
            self._print_to_widget(data)
            
        # Flet 위젯의 값이 변했으므로 화면을 갱신합니다.
        self.log_text.update()

    def _clear_widget(self):
        """위젯 전체 삭제"""
        self.log_text.value = ""

    def _print_to_widget(self, data):
        """정밀한 출력 로직 (Flet 문자열 조작 방식)"""
        msg = data.get("msg", "")
        replace = data.get("replace", False)
        
        # 현재 입력된 전체 텍스트를 가져옵니다.
        current_value = self.log_text.value if self.log_text.value else ""

        if replace:
            # 1. 마지막 줄 교체 로직
            # 줄 단위로 나눈 뒤 마지막 요소를 새 메시지로 바꿉니다.
            lines = current_value.split("\n")
            if lines:
                lines[-1] = msg 
                self.log_text.value = "\n".join(lines)
            else:
                self.log_text.value = msg
        else:
            # 2. 새 줄 추가 로직
            if current_value:
                # 내용이 있으면 줄바꿈 후 추가
                self.log_text.value = f"{current_value}\n{msg}"
            else:
                # 첫 내용이면 그냥 추가
                self.log_text.value = msg
        
        # 항상 최하단으로 스크롤 (Flet의 scroll_to 활용)
        # offset=-1은 가장 마지막 지점을 의미합니다.
        self.log_text.scroll_to(offset=-1, duration=100)