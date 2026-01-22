# app/log/executor.py

import queue
import asyncio

class LogExecutor:
    """
    백그라운드에서 큐를 감시하며 로그를 UI에 비동기적으로 출력하는 실행기.
    """
    def __init__(self, page):
        self.page = page
        self.log_queue = None # 큐는 start 시점에 외부에서 주입
        self.printer = None   # 프린터도 start 시점에 외부에서 주입
        self.running = True


    def start(self, printer, log_queue, manager):
        """실제 작업을 시작하고, 필요한 외부 객체들을 주입받습니다."""

        self.printer = printer
        self.log_queue = log_queue
        self.manager = manager
        if self.page:
            # 백그라운드에서 _monitor 코루틴 실행
            self.page.run_task(self._monitor)

    async def _monitor(self):
        """
        [Async Method] 실제 백그라운드에서 돌아가는 무한 루프
        """
        try:
            while self.running:
                updated = False
                # 1. 큐에 쌓인 데이터 일괄 처리
                while not self.log_queue.empty():
                    try:
                        data = self.log_queue.get_nowait()
                        if self.printer:

                            self.printer.render(data)
                            updated = True
                        self.log_queue.task_done()
                    except queue.Empty:
                        break

                # 2. 변경사항이 있으면 UI 업데이트 (제어권 위임)
                # UI가 실제로 준비되었을 때만 업데이트를 수행
                if updated and hasattr(self.printer.log_text, 'perform_update') and self.manager.ui_ready:
                    self.printer.log_text.perform_update()

                # 3. 제어권 양보
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            self.running = False
            return

def create_executor(*args, **kwargs) -> LogExecutor:
    """LogExecutor 인스턴스를 생성하여 반환하는 팩토리 함수"""

    return LogExecutor(*args, **kwargs)