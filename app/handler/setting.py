import tkinter as tk
from app.setting_service import SettingService
import app.log as app_log

class SettingHandler:
    def __init__(self, handler, config):
        # 1. 이제 부모(handler)와 데이터(config)를 명시적으로 따로 받습니다.
        self.handler = handler
        self.config = config  # 직접 주입받은 데이터 모델 (AppConfig)
        
        # 2. 서비스 계층 생성 (경로 정보를 전달)
        self.service = SettingService(handler.path)        

    def load_api_list(self):
        """저장된 키 목록을 읽어 메모리(config)에 동기화하고 UI에 알림"""
        keys = self.service.read_api_keys()
        
        # self.handler.config 대신 self.config로 직접 접근
        self.config.api_keys = keys
        self.config.selected_api = keys[0]
        # UI가 등록해둔 갱신용 함수가 있다면 호출 (Callback 방식)
        if hasattr(self.handler, 'ui_set_api_list'):
            self.handler.ui_set_api_list(keys)

    def handle_select(self, selected):
        """UI로부터 선택된 값을 직접 인자로 받아 처리"""
        if not selected or selected == "없음": 
            return
        
        # 현재 선택된 값을 메모리에 즉시 반영
        self.config.selected_api = selected
        
        # 순서 재배치 로직 수행 및 파일 저장
        new_keys = self.service.get_reordered_keys(selected)
        self.service.write_api_keys(new_keys)
        
        self.load_api_list() # 목록 새로고침
        app_log.write(f"API Key 선택됨: {selected[:10]}...")

    def add_api_key(self, new_key):
        """새로운 키를 인자로 받아 추가 로직 수행"""
        if not new_key: 
            return
        
        new_keys = self.service.get_added_keys(new_key)
        self.service.write_api_keys(new_keys)
        
        self.load_api_list()
        # 입력창 비우기 등의 UI 제어는 이 함수를 부른 UI 측에서 수행함

    def save(self, version, rule):
        """전달받은 데이터를 메모리에 저장하고 파일로 기록"""
        # 메모리(config) 업데이트
        self.config.model_version = version
        self.config.prompt_rule = rule
        
        # 파일 저장
        self.service.save_config(version, rule)
        app_log.write("설정이 저장되었습니다.")

    def load(self):
        """파일에서 읽어온 데이터를 메모리에 채우고 UI에 배달"""
        version, rule = self.service.load_config()
        
        # 메모리(config) 업데이트
        self.config.model_version = version
        self.config.prompt_rule = rule
        
        # UI 전용 메서드 호출하여 화면 갱신
        if hasattr(self.handler, 'ui_set_config_data'):
            self.handler.ui_set_config_data(version, rule)