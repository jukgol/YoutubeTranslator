class TranslateInterface:
    def process_split(self):
        self.process.handle_split()

    def process_translate(self):
        self.process.handle_translate()

    def process_test(self):
        self.process.handle_test()

    def handle_combine_parts(self):
        self.process.handle_combine_parts()

    def process_combine_timeline(self):
        self.process.handle_combine_timeline()

    def process_full_start(self):
        self.full_process.execute()

    def process_full_stop(self):
        self.full_process.request_stop()

    def process_add_to_queue(self, tab):
        if self.queue_manager:
            # 탭 객체 하나만 매니저에게 토스합니다.
            self.queue_manager.handle_add(tab, self.log)

    def process_clear_queue(self, tab):
        if self.queue_manager:
            self.queue_manager.clear(tab)
            self.log("🧹 작업 큐가 초기화되었습니다.")

    def process_copy_to_video(self, tab):
        """최종 결과 파일을 비디오 폴더로 복사하는 프로세스"""
        # move -> copy 로 변경된 함수를 호출
        self.queue_manager.handle_copy_file(
            tab, 
            self.path,
            self.refresh, 
            self.log
        )