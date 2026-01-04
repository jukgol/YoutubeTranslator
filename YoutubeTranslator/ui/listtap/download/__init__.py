import flet as ft
from .layout import setup_download_layout
# from .events import connect_download_events  # 나중에 연결
#from .bridge import register_download_bridge

class DownloadTab(ft.Column):
    def __init__(self, handler):
        super().__init__()
        self.handler = handler
        self.expand = True  # 탭 공간을 가득 채우도록 설정
        
        # 1. 화면 구성 (layout.py 호출)
        setup_download_layout(self)
        
        # 2. 핸들러와 위젯 직접 연결 (참조 등록)
        # 로직 연결은 나중에 하더라도, 핸들러가 위젯을 찾을 수 있게 브릿지는 미리 호출합니다.
        #register_download_bridge(self)
        
        # 3. 이벤트 바인딩 (나중에 진행)
        # connect_download_events(self)