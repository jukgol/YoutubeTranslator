# app/log/manager.py

import queue

class _LogManager:
    """
    로그 시스템의 각 컴포넌트(executor, section 등) 인스턴스를
    보관하는 중앙 저장소.
    """
    def __init__(self):
        self.executor = None
        self.section = None
        self.handler = None
        self.log_queue = queue.Queue()
        self.ui_ready = False # UI 준비 상태 플래그 추가
