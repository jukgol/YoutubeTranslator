def connect_simple_events(self, h):
    """버튼과 핸들러의 기능을 Flet 방식으로 연결합니다."""   
    
    # .config 대신 .on_click 사용
    # Flet 이벤트 객체(e)를 무시하기 위해 lambda _: 를 사용합니다.
    self.add_to_queue_btn.on_click = lambda _: h.process_add_to_queue(self)
    self.clear_queue_btn.on_click = lambda _: h.process_clear_queue(self)
    
    # 3. 번역 시작
    self.queue_start_btn.on_click = lambda _: h.process_full_start()
    
    # 4. 멈춤 버튼들
    self.queue_stop_btn.on_click = lambda _: h.process_full_stop()
    self.status_stop_btn.on_click = lambda _: h.process_full_stop()

    # 5. 파일 이동
    self.move_file_btn.on_click = lambda _: h.process_copy_to_video(self)

    self.on_active = lambda _: h.simple.refresh_all()