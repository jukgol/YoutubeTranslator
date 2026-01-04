import queue
import asyncio

class LogExecutor:
    def __init__(self, page):
        self.page = page
        self.log_queue = queue.Queue()
        self.printer = None
        self.running = True

    def get_queue(self):
        return self.log_queue

    def start(self, printer):
        """
        [Sync Method] 외부에서 호출하는 엔트리 포인트.
        내부에서 스스로 비동기 태스크(루프)를 등록합니다.
        """
        self.printer = printer
        
        # 유니티의 StartCoroutine처럼, 내부에서 비동기 루프를 백그라운드로 쏘아 올립니다.
        # 이제 외부에서 page.run_task를 호출할 필요가 없습니다.
        if self.page:
            self.page.run_task(self._monitor)

    async def _monitor(self):
        """
        [Async Method] 실제 백그라운드에서 돌아가는 무한 루프
        """
        while self.running:
            updated = False
            
            # 1. 큐에 쌓인 데이터 일괄 처리 (Batch)
            while not self.log_queue.empty():
                try:
                    data = self.log_queue.get_nowait()
                    if self.printer:
                        self.printer.render(data) # 리스트에 추가 (update X)
                        updated = True
                    self.log_queue.task_done()
                except queue.Empty:
                    break

            # 2. 변경사항이 있으면 딱 한 번만 비동기 업데이트
            if updated and self.printer:
                # LogPanel의 비동기 업데이트 메서드 호출
                self.printer.log_text.perform_update()

            # 3. 제어권 양보 (유니티의 yield return)
            await asyncio.sleep(0.1)