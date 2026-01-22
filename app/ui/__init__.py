import flet as ft
from .listtap.config import ConfigSection
from ..log import LogSection
from .listtap import ListTabContainer

def compose_ui(app):    
    page = app.page        

    # 중간 탭 영역이 화면의 남은 세로 공간을 모두 차지하도록 expand=True 설정
    app.list_tabs.expand = True
    # DEBUG: 강제로 높이 부여(진단용) — 이 줄은 문제 확인 후 제거할 예정입니다.
    app.list_tabs.height = 700
    app.list_sec = app.list_tabs.detail_tab # 기존 핸들러 호환성 유지    # 3. 로그 섹션
    

    # 4. 전체 레이아웃 조립 (Vertical Column)
    # Tkinter의 pack(side=TOP)과 유사하게 위에서부터 순서대로 배치합니다.
    page.add(
        ft.Column(
            controls=[                
                app.list_tabs,      # 상단 탭 영역 (확장 가능)
                app.log_sec,        # 하단 로그 영역
            ],
            expand=True,            # 전체 컬럼이 페이지 높이를 꽉 채우도록 설정
            spacing=10,             # 섹션 간 간격 (pady 대응)
        )
    )
    # 레이아웃을 다 그린 후 최종 페이지 업데이트
    page.update()