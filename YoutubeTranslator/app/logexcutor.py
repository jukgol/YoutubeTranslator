import queue

class LogExecutor:
    def __init__(self, root):
        """
        초기화 단계: 통신 채널(Queue)을 생성하고 관리함
        root: Tkinter 메인 루프 예약을 위한 객체
        """
        self.root = root
        self.log_queue = queue.Queue()  # 내부에서 큐 생성
        self.printer = None             # 초기에는 출력 장치가 없음 (Late Binding)

    def get_queue(self):
        """LogHandler에게 전달할 통신 채널 반환"""
        return self.log_queue

    def start_executor(self, printer):
        """
        UI 구성이 완료된 후 호출: 출력 장치(PrintText)를 연결하고 감시 시작
        printer: LogSection에서 생성된 PrintText 인스턴스
        """
        self.printer = printer
        self._monitor()

    def _monitor(self):
        """큐를 감시하여 printer에게 렌더링을 지시하는 루프"""
        try:
            # 큐가 비어있을 때까지 모든 패킷 처리
            while True:
                data = self.log_queue.get_nowait()
                
                # printer가 등록된 상태라면 출력 실행
                if self.printer:
                    self.printer.render(data)
                
                self.log_queue.task_done()
        except queue.Empty:
            # 큐가 비어있으면 다음 주기로 넘어감
            pass
        #finally:
            # 100ms 후 다시 실행 (메인 스레드 점유 방지)
            #self.root.after(100, self._monitor)