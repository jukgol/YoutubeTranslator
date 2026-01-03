import flet as ft
from .layout import setup_detail_layout
# from .events import connect_detail_events # 나중에 연결할 예정

class DetailTab(ft.Column):
    def __init__(self, handler):
        super().__init__()
        self.handler = handler
        # Column의 속성 설정 (Tkinter의 Frame 역할)
        self.expand = True
        
        # 1. 레이아웃 생성 (Flet 버전 layout.py 호출)
        setup_detail_layout(self)
        
        # 2. 핸들러에 위젯 참조 등록 
        # (이건 레이아웃이 만들어진 직후에 해야 핸들러가 위젯을 찾을 수 있습니다)
        self._register_to_handler()
        
        # 3. 이벤트 연결 (사용자 요청에 따라 나중에 진행)
        # connect_detail_events(self)

    def _register_to_handler(self):
        """handler가 위젯 객체들을 직접 참조할 수 있도록 등록"""
        h = self.handler
        # layout.py에서 생성되어 self에 붙은 객체들을 핸들러로 전달
        h.origin_listbox = self.origin_list
        h.split_listbox = self.split_list
        h.translated_listbox = self.translated_list
        h.combine_listbox = self.combine_list
        h.result_listbox = self.result_list