# app/log/manager.py

import queue

class _LogManager:
    """
    로그 시스템의 각 컴포넌트(executor, section 등) 인스턴스를
    보관하는 중앙 저장소.
    """
    def __init__(self):
        print("▶️ [LogManager] 생성됨")
        self.executor = None
        self.section = None
        self.handler = None
        self.log_queue = queue.Queue() # 큐를 매니저에서 직접 생성
