import flet as ft
from .layout import setup_download_layout
from .events import connect_download_events
from .handle import DownloadHandler


class DownloadTab(ft.Column):
    def __init__(self):
        super().__init__()        
        self.expand = True
        self.on_active = None
        # 1. 껍데기 생성 (Layout)
        setup_download_layout(self)
        self.download = DownloadHandler(self, None) # page 인자 필요. DownloadTab.__init__에서 받아야 함

    def setup_handler(self):
        """
        [리팩토링 통합] 흩어져 있던 브릿지와 이 곳에서 배선합니다.
        이제 부모 컨테이너는 이 함수 하나만 호출하면 됩니다.
        """
        # A. 출력 배선 (Handler가 UI를 조종할 수 있게 함)
        # register_download_bridge(self) # 더 이상 브릿지 필요 없음
        
        # B. 입력 배선 (UI가 Handler를 호출할 수 있게 함)
        connect_download_events(self)
        
        print("✅ DownloadTab: 입출력 브릿지 및 이벤트 배선 완료")


