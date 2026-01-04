from tkinter.tix import Form
from handler.log import LogHandler
from .setting import SettingHandler
from .process import ProcessHandler
from .steps.full_process import FullProcessStep

# 분리한 인터페이스 임포트
from .interface.log import LogInterface
from .interface.system import SystemInterface
from .interface.translate import TranslateInterface
from .interface.download import DownloadInterface
from .queue_manager import QueueManager

class UIHandlers(LogInterface, SystemInterface, TranslateInterface, DownloadInterface):
    def __init__(self, app, path, config, log_queue):
        self.app = app
        self.path = path        
        self.config = config
        # 핵심 영역별 초기화
        self._init_config(config)
        self._init_log(log_queue)
        self._init_translate()
        self._init_download()

    def _init_config(self, config):
        self.setting = SettingHandler(self, config)

    def _init_log(self, log_queue):
        self.log_handler = LogHandler(log_queue)

    def _init_translate(self):
        #self.refresh = RefreshHandler(self)
        self.process = ProcessHandler(self)
        self.full_process = FullProcessStep(self, self.process.path_service)
        self.queue_manager = QueueManager()

    def _init_download(self):
        from logic.UrlManger import UrlManager
        from .download import DownloadHandler # 신규 파일 임포트        
        self.url_manager = UrlManager()
        self.download = DownloadHandler(self, self.url_manager, self.path) # 일꾼 객체 생성 및 연결