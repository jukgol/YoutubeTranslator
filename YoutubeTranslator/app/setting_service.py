# app/setting_service.py
import os

class SettingService:
    def __init__(self, path_manager):
        self.path = path_manager

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

    def save_config(self, version, rule):
        """버전 정보와 번역 규칙을 저장합니다."""
        with open(self.path.gemini_ver_file, "w", encoding="utf-8") as f:
            f.write(version)
        with open(self.path.rule_file, "w", encoding="utf-8") as f:
            f.write(rule)

    def load_config(self):
        """저장된 버전 정보와 규칙을 불러옵니다. (없으면 빈값)"""
        version, rule = "", ""
        if os.path.exists(self.path.gemini_ver_file):
            with open(self.path.gemini_ver_file, "r", encoding="utf-8") as f:
                version = f.read().strip()
        if os.path.exists(self.path.rule_file):
            with open(self.path.rule_file, "r", encoding="utf-8") as f:
                rule = f.read().strip()
        return version, rule

    def get_reordered_keys(self, selected):
        """
        선택된 키(selected)를 리스트의 맨 앞으로 이동시킨 후 전체 리스트를 반환합니다.
        """
        keys = self.read_api_keys()
        if selected in keys:
            keys.remove(selected)  # 기존 위치에서 제거
            keys.insert(0, selected)  # 맨 앞으로 삽입
        return keys