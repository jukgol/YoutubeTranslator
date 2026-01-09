def register_log_bridge(self, h):
    """
    self: LogSection 인스턴스
    """   
    
    # 2. 로그 초기화 버튼 이벤트 연결
    self.clear_log_btn.on_click = lambda _: h.handle_clear_log()   
    

    # 3. 목록 새로고침 버튼 (핸들러에 해당 기능이 있다면 연결)
    self.refresh_btn.on_click = lambda _: h.refresh_all()