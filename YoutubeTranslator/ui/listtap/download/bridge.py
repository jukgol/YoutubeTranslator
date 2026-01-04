def _update_list_panel(panel, data):
    """SmartListPanel에 데이터를 안전하게 채우는 헬퍼 함수"""
    if isinstance(data, list):
        panel.set_list(data)
    else:
        panel.set_list([str(data)])

def register_download_bridge(self, handler):
    """핸들러가 UI를 조작할 수 있는 전용 함수(Bridge)를 등록합니다."""
    h = handler
    
    # 리스트 업데이트 브릿지
    h.ui_update_queue_display = lambda lines: _update_list_panel(self.url_list, lines)
    h.ui_update_download_list = lambda text: _update_list_panel(self.url_list, text)
    h.ui_set_video_folder_list = lambda text: _update_list_panel(self.video_file_list, text)
    h.ui_set_subtitle_folder_list = lambda text: _update_list_panel(self.subtitle_file_list, text)

    # 입력창 제어 브릿지
    def clear_url_input():
        self.url_entry.value = ""
        self.url_entry.update()

    h.ui_clear_download_url_input = clear_url_input