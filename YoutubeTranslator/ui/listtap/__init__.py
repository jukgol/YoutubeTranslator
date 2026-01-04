import flet as ft
from .detail import DetailTab
from .simple import SimpleTab
from .download import DownloadTab
from .config import ConfigSection

class ListTabContainer(ft.Column): 
    def __init__(self):
        super().__init__() 
        self.expand = True         

        # 1. 자식 탭 인스턴스 생성 (아직 배선은 되지 않은 상태)
        self.download_tab = DownloadTab()
        self.simple_tab = SimpleTab()
        self.detail_tab = DetailTab()
        self.config_sec = ConfigSection()

        # 2. 레이아웃 배치
        self.controls = [
            ft.Tabs(
                selected_index=0,
                tabs=[
                    ft.Tab(text=" 영상 다운로드 ", content=self.download_tab),
                    ft.Tab(text=" 한번에 번역 ", content=self.simple_tab),
                    ft.Tab(text=" 세분화 번역 ", content=self.detail_tab),
                    ft.Tab(text=" 설정 ", content=self.config_sec), # 텍스트 정리
                ],
                expand=True,
            )
        ]

    def setup_handler(self, h):
        """
        [최종 마스터 스위치]
        이 함수 한 번의 호출로 모든 자식 탭의 배선(Wiring)을 일괄 가동합니다.
        """
        # 각 자식 탭들이 가진 표준화된 배선 함수를 순서대로 호출
        self.download_tab.setup_handler(h)
        self.simple_tab.setup_handler(h)
        self.detail_tab.setup_handler(h)
        self.config_sec.setup_handler(h)
        
        print("🚀 [Master] 모든 UI 탭과 핸들러 배선이 완료되었습니다.")