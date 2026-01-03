import tkinter as tk
from .config import ConfigSection
from .log import LogSection
from .listtap import ListTabContainer

def compose_ui(app):
    handler = app.handlers

    # 1. 설정 섹션 (등록 완료)
    app.config_sec = ConfigSection(app.root, handler)
    app.config_sec.pack(fill=tk.X, padx=10, pady=5)

    # 2. 리스트 섹션 (Simple/Detail 탭 모두 등록 완료)
    # ListTabContainer 내부에서 SimpleTab과 DetailTab이 스스로 배선을 처리합니다.
    app.list_tabs = ListTabContainer(app.root, handler)
    app.list_tabs.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
    
    app.list_sec = app.list_tabs.detail_tab # 호환성 유지

    # 3. 로그 섹션 (LogSection도 동일하게 handler만 전달)
    app.log_sec = LogSection(app.root, handler)
    app.log_sec.pack(fill=tk.X, padx=10, pady=5)
