import flet as ft

# 공통 가공 함수 (Flet 버전)
def _update_flet_widget(widget, text):
    """Flet TextField의 값을 업데이트하고 화면에 반영합니다."""
    widget.value = text
    widget.update()

def register_download_bridge(self):
    """
    DownloadTab(self)의 위젯들을 핸들러(h)에 직접 바인딩합니다.
    """
    h = self.handler
    
    # h.root 대신 Flet의 page 객체를 연결합니다.
    # self.page는 해당 컨트롤이 화면에 배치된 후 접근 가능합니다.
    h.page = self.page 

    # 리스트 업데이트 로직 연결 (TextField의 .value 수정)
    h.ui_update_queue_display = lambda lines: _update_flet_widget(self.url_list, "\n".join(lines))
    h.ui_update_download_list = lambda text: _update_flet_widget(self.url_list, text)
    h.ui_set_video_folder_list = lambda text: _update_flet_widget(self.video_file_list, text)
    h.ui_set_subtitle_folder_list = lambda text: _update_flet_widget(self.subtitle_file_list, text)    

    # 입력창 비우기 (TextField의 .value를 빈 값으로)
    def clear_url_input():
        self.url_entry.value = ""
        self.url_entry.update()

    h.ui_clear_download_url_input = clear_url_input

    # 초기 데이터 로드 (이 시점에 위젯들이 준비되어 있어야 함)
    # 만약 에러가 난다면 page.on_load 이후에 호출하도록 조정이 필요할 수 있습니다.
    h.download.refresh_folder_lists()