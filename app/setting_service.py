# app/setting_service.py
import os
from app.path import paths

class SettingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SettingService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.path = paths
        self._initialized = True

    def read_api_keys(self):
        """저장된 API 키 목록을 읽어옵니다."""
        path = self.path.api_file
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip()]

    def write_api_keys(self, keys):
        """API 키 목록을 파일에 저장합니다."""
        with open(self.path.api_file, "w", encoding="utf-8") as f:
            f.write("\n".join(keys))

    def save_version(self, version):
        """버전 정보를 파일에 저장합니다."""
        with open(self.path.gemini_ver_file, "w", encoding="utf-8") as f:
            f.write(version)

    def load_version(self):
        """저장된 버전 정보를 불러옵니다. (없으면 빈값)"""
        if not os.path.exists(self.path.gemini_ver_file):
            return ""
        with open(self.path.gemini_ver_file, "r", encoding="utf-8") as f:
            return f.read().strip()

    def save_rule(self, rule):
        """번역 규칙을 파일에 저장합니다."""
        with open(self.path.rule_file, "w", encoding="utf-8") as f:
            f.write(rule)

    def load_rule(self):
        """저장된 번역 규칙을 불러옵니다. (없으면 빈값)"""
        if not os.path.exists(self.path.rule_file):
            return ""
        with open(self.path.rule_file, "r", encoding="utf-8") as f:
            return f.read().strip()

    def get_reordered_keys(self, selected):
        """
        선택된 키(selected)를 리스트의 맨 앞으로 이동시킨 후 전체 리스트를 반환합니다.
        """
        keys = self.read_api_keys()
        if selected in keys:
            keys.remove(selected)  # 기존 위치에서 제거
            keys.insert(0, selected)  # 맨 앞으로 삽입
        return keys

    def get_added_keys(self, new_key):
        """
        새로운 키(new_key)를 리스트의 맨 앞으로 추가한 후 전체 리스트를 반환합니다.
        이미 키가 존재하면 맨 앞으로 이동시킵니다.
        """
        keys = self.read_api_keys()
        if new_key in keys:
            keys.remove(new_key)
        keys.insert(0, new_key)
        return keys

# Create a module-level instance that can be imported
setting_service = SettingService()