
import app.log as log

# from .setting import SettingHandler
from .detail import Detail
from .steps.full_process import FullProcessStep

# 분리한 인터페이스 임포트

from .interface.system import SystemInterface
from .interface.translate import TranslateInterface
from .interface.download import DownloadInterface
from .simple import Simple

class UIHandlers(SystemInterface, TranslateInterface, DownloadInterface):
    def __init__(self, app, path, config):
        self.app = app
        self.path = path        
        self.config = config
        self.page = app.page
        # 핵심 영역별 초기화
        self._init_config(config)
        self._init_translate()
        self._init_download()

    def _init_config(self, config):
        # self.setting = SettingHandler(self, config)
        pass


    def _init_translate(self):
        #self.refresh = RefreshHandler(self)
        self.detail = Detail(self)
        self.full_process = FullProcessStep(self, self.detail.path_service)
        self.simple = Simple()

    def _init_download(self):
        from app.logic.UrlManger import UrlManager
        from .download import DownloadHandler # 신규 파일 임포트        
        self.url_manager = UrlManager()
        self.download = DownloadHandler(self, self.url_manager, self.path, self.page) # 일꾼 객체 생성 및 연결

    def init_settings(self):
        """
        [마스터 초기화] 앱 시작 시 각 핸들러들의 초기 상태를 세팅합니다.
        """
        # 1. 설정 데이터 로드 (API 키, 버전 등)
        self.load_config_settings()
     
        # 2. Simple 탭(번역 큐) 초기화
        # 1번 코드의 initialize_tab_lists와 유사하게, 
        # UIHandlers가 관리하는 app.list_tabs 내의 위젯들을 대상으로 리스트를 채웁니다.
        if hasattr(self.app, 'list_tabs'):
            # Simple 탭의 파일 목록(원본/결과) 및 큐 리스트 초기화
            self.simple.initialize_tab_lists(self.app.list_tabs.simple_tab)
            self.detail.initialize_tab_lists(self.app.list_tabs.detail_tab)            
            self.download.refresh_folder_lists()            
        
        log.write("✅ 모든 탭의 데이터 초기화가 완료되었습니다.")
        

    def refresh_all(self):
        self.download.refresh_folder_lists()
        self.simple.refresh_all()
        self.detail.refresh_all()
        log.write("🔄 모든 목록을 초기화했습니다.")