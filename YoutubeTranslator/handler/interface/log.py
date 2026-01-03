class LogInterface:
    def log(self, message, replace=False):
        #print(f"DEBUG: 브릿지 도착 - msg: {message[:10]}..., replace: {replace}")
        if self.log_handler:
            self.log_handler.log(message, replace=replace)
        else:
            print(f"경고: 로그 출력 창구가 등록되지 않음 ")

    def update_timer_log(self, message):
        """타이머 전용 로그 업데이트"""
        if self.log_handler:
            self.log_handler.update_timer(message)

    def handle_clear_log(self):
        if self.log_handler:
            self.log_handler.clear()
