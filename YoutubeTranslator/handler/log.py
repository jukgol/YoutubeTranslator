from datetime import datetime

class LogHandler:
    def __init__(self, log_queue):
        """
        log_queue: 가공된 로그 패킷이 담길 queue.Queue 인스턴스
        """
        self.log_queue = log_queue

    def write(self, message):
        """일반 로그 기록 (타임스탬프 포함 패킷 생성)"""
        timestamp = datetime.now().strftime("[%H:%M:%S] ")
        
        # UI에 직접 쓰는 대신, 규격화된 패킷을 큐에 전달
        self.log_queue.put({
            "msg": f"{timestamp}{message}",
            "replace": False
        })

    def update_timer(self, message):
        """
        타이머 전용 로그: 마지막 줄 교체 옵션과 함께 메시지 전달
        """
        # 타이머는 보통 실시간 갱신이므로 가공 없이 메시지만 전달하거나 
        # 필요한 최소한의 가공만 수행하여 전송
        self.log_queue.put({
            "msg": message,
            "replace": True
        })

    def clear(self):
        """로그 창 초기화 신호 전달"""
        # 메시지 대신 특정 타입을 지정하여 Executor가 초기화 로직을 수행하도록 함
        self.log_queue.put({
            "type": "clear"
        })

    def log(self, message, replace=False):
        """
        기존 로직의 흐름을 유지하며 큐로 데이터 전달
        replace=False: 새 줄에 타임스탬프와 함께 기록
        replace=True: 마지막 줄 교체 요청
        """        
        if replace:
            # 교체 시에는 보통 타임스탬프를 생략하여 UI를 깔끔하게 유지
            self.log_queue.put({
                "msg": message, 
                "replace": True
            })
        else:
            timestamp = datetime.now().strftime("[%H:%M:%S] ")
            self.log_queue.put({
                "msg": f"{timestamp}{message}", 
                "replace": False
            })