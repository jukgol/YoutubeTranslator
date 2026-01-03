def connect_detail_events(self):
    """각 단계별 버튼과 핸들러 로직을 연결합니다."""
    h = self.handler
    
    # 1. 분리 실행 (master는 각 LabelFrame을 감싸고 있는 변수입니다)
    self.origin_list.master.main_btn.config(command=h.process.handle_split)
    
    # 2. 번역 시작 및 테스트
    self.split_list.master.main_btn.config(command=h.process.handle_translate)
    self.split_list.master.test_btn.config(command=h.process.handle_test)
    
    # 3. 파트 합치기
    self.translated_list.master.main_btn.config(command=h.process.handle_combine_parts)
    
    # 4. 타임라인 생성
    self.combine_list.master.main_btn.config(command=h.process.handle_combine_timeline)
    
    # 5. 결과 확인 (필요 시 연결)
    # self.result_list.master.main_btn.config(command=...)