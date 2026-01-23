class ConfigEvents:
    def setup_handler(self, h):
        """
        [표준화] 다른 탭들과 형식을 맞추기 위해 핸들러 등록 로직을 이리로 모았습니다.
        이제 중앙 제어 장치가 이 함수만 실행하면 배선이 끝납니다.
        """
        self.handler = h

        h.ui_set_api_list = self.set_api_list
        h.ui_set_config_data = self.set_config_data
        h.ui_update_usage_status = self.update_usage_status
        h.ui_clear_api_input = self.clear_api_input
        
        print("✅ ConfigSection: 핸들러 및 인터페이스 배선 완료")
