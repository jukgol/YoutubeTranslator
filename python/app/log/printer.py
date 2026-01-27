class PrintText:
    def __init__(self, log_widget):
        # 이제 log_widget은 SmartListPanel 인스턴스입니다.
        self.log_text = log_widget

    def render(self, data):
        if not self.log_text:
            return

        if data.get("type") == "clear":
            self.log_text.clear()
        else:
            self._print_to_widget(data)
        
        # SmartListPanel 내부에서 이미 update()를 수행하므로 
        # 여기서 별도로 self.log_text.update()를 호출할 필요가 없어집니다.

    def _print_to_widget(self, data):
        msg = data.get("msg", "")
        replace = data.get("replace", False)
        
        # 텍스트 색상 옵션 등이 data에 있다면 활용 가능 (예: data.get("color"))
        
        if replace:
            # SmartListPanel에 새로 추가한 메서드 사용
            self.log_text.replace_last(msg)
        else:
            # SmartListPanel의 기존 메서드 사용
            self.log_text.add(msg)