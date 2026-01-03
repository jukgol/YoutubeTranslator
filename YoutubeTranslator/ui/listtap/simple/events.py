def connect_simple_events(self):
    """버튼과 핸들러의 기능을 연결합니다 (데이터 중심 방식)"""
    h = self.handler
    
    self.add_to_queue_btn.config(command=lambda: h.process_add_to_queue(self)
)

    self.clear_queue_btn.config(command=lambda: h.process_clear_queue(self))
    
    # 3. 번역 시작 (필요 시 위젯의 상태를 인자로 넘김)
    self.queue_start_btn.config(command=h.process_full_start)
    
    # 4. 멈춤 버튼들
    self.queue_stop_btn.config(command=h.process_full_stop)
    self.status_stop_btn.config(command=h.process_full_stop)

    self.move_file_btn.config(command=lambda: h.process_copy_to_video(self))