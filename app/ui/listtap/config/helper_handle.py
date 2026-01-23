from app.setting_service import SettingService
import app.log as app_log
from app.config import app_config

class ConfigCommonHandler:
    def __init__(self, handler):
        # 1. 이제 부모(handler)를 명시적으로 받습니다.
        self.handler = handler
        # self.config = config  # 직접 주입받은 데이터 모델 (AppConfig)
        
        # 2. 서비스 계층 생성 (경로 정보를 전달)
        self.service = SettingService(handler.path)        

    def save(self, version, rule):
        """전달받은 데이터를 메모리에 저장하고 파일로 기록"""
        # 메모리(config) 업데이트 (app_config에서 관리됨)
        # self.config.model_version = version
        # self.config.prompt_rule = rule
        
        # 파일 저장
        self.service.save_version(version)
        self.service.save_rule(rule)
        app_log.write("설정이 저장되었습니다.")

    def load(self):
        """파일에서 읽어온 데이터를 메모리에 채우고 UI에 배달"""
        version = self.service.load_version()
        rule = self.service.load_rule()
        
        # 메모리(config) 업데이트 (app_config에서 관리됨)
        # self.config.model_version = version
        # self.config.prompt_rule = rule
        
        # UI 전용 메서드 호출하여 화면 갱신
        if hasattr(self.handler, 'ui_set_config_data'):
            self.handler.ui_set_config_data(version, rule)