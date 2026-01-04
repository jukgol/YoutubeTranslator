import flet as ft
from .detail import DetailTab
from .simple import SimpleTab
from .download import DownloadTab
from .config import ConfigSection

# 1. ft.Column을 상속받아 진짜 UI 객체로 만듭니다.
class ListTabContainer(ft.Column): 
    def __init__(self, handler):
        # 2. 부모 클래스(ft.Column)의 생성자를 가장 먼저 호출합니다. (필수)
        super().__init__() 
        self.expand = True  # 화면 전체를 채우도록 설정
        
        self.handler = handler

        # 탭 컨텐츠 생성
        self.config_sec = ConfigSection(handler)
        self.detail_tab = DetailTab(handler)
        self.simple_tab = SimpleTab(handler)
        self.download_tab = DownloadTab(handler)

        # 3. self.control이라는 변수 대신, self.controls 리스트에 UI 요소를 담습니다.
        self.controls = [
            ft.Tabs(
                selected_index=0,
                tabs=[
                    ft.Tab(
                        text=" 영상 다운로드 ",
                        content=self.download_tab,                        
                    ),
                    ft.Tab(
                        text=" 한번에 번역 ",
                        content=self.simple_tab,                        
                    ),
                    ft.Tab(
                        text=" 세분화 번역 ",
                        content=self.detail_tab,                        
                    ),
                    ft.Tab(
                        text=" 설정 번역 ",
                        content=self.config_sec,                        
                    ),
                ],
                expand=True,
            )
        ]