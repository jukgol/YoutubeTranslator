import flet as ft
from .layout import setup_detail_layout
from .events import connect_detail_events

class DetailTab(ft.Column):
    def __init__(self):
        super().__init__()        
        self.expand = True
        
        self.on_active = None
        # 1. UI 외형 구축 (가구 배치)
        # 껍데기만 먼저 만듭니다.
        setup_detail_layout(self)

    def setup_handler(self, h):
        """
        [리팩토링 핵심] 디테일탭의 배선을 이 곳에서 전담합니다.
        불필요한 강조 로직 없이, 오직 입출력 채널만 연결합니다.
        """
        # A. 핸들러에 각 단계별 리스트박스 등록 (출력 채널)
        h.origin_listbox = self.origin_list
        h.split_listbox = self.split_list
        h.translated_listbox = self.translated_list
        h.combine_listbox = self.combine_list
        h.result_listbox = self.result_list

        # B. 각 단계별 버튼 이벤트 연결 (입력 트리거)
        # 리팩토링된 events.py를 호출하여 버튼-핸들러 로직을 묶습니다.
        connect_detail_events(self, h)
        
        print("✅ DetailTab: 5단계 공정 배선 완료 (수동 제어 모드)")