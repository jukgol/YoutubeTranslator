import sys
import os
from pathlib import Path

class PathManager:
    def __init__(self):
        if getattr(sys, "frozen", False):
            self.base_dir = Path(sys.executable).parent
        else:
            # 개발 시: 소문자 폴더의 부모(프로젝트 최상위) 폴더 기준
            # 경로: <project_root>/youtubetranslator/path.py -> parent.parent == project root
            self.base_dir = Path(__file__).resolve().parent.parent

        # --- [1. 폴더 경로 정의] ---
        data_dir = self.base_dir / "data"
        self.origin_dir = data_dir / "origin"
        self.split_dir = data_dir / "split"
        self.translate_dir = data_dir / "translate"
        self.combine_dir = data_dir / "combine"
        self.result_final_dir = data_dir / "result"
        self.video_dir = data_dir / "video"      # 영상 파일(.mp4) 저장 위치
        
        # config 폴더 경로
        config_dir = self.base_dir / "config"

        # --- [2. 파일 경로 정의] ---
        self.api_file = config_dir / "api.txt"
        self.rule_file = config_dir / "rule.txt"
        self.gemini_ver_file = config_dir / "gemini_ver.txt"
        self.cookie_file = config_dir / "cookies.txt"
        # --- [3. 폴더 자동 생성] ---
        self.all_dirs = [
            self.origin_dir, self.split_dir, self.translate_dir, 
            self.combine_dir, self.result_final_dir, self.video_dir
        ]
        
        for d in self.all_dirs:
            os.makedirs(d, exist_ok=True)

    # --- [4. 유틸리티 메서드] ---
    def get_video_path(self, filename):
        """영상 저장용 전체 경로 반환 (문자열)"""
        return str(self.video_dir / filename)

    def get_origin_sub_path(self, filename):
        """자막 저장용 전체 경로 반환 (Origin 폴더, 문자열)"""
        return str(self.origin_dir / filename)


paths = PathManager()