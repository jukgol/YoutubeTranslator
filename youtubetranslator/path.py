import sys
import os
from pathlib import Path

class PathManager:
    def __init__(self):
        if getattr(sys, "frozen", False):
            self.base_dir = Path(sys.executable).parent
        else:
            # 개발 시: 소문자 폴더의 부모(최상위) 폴더 기준
            self.base_dir = Path(__file__).resolve().parent.parent.parent

        # --- [1. 폴더 경로 정의] ---
        self.origin_dir = self.base_dir / "data" / "origin"
        self.split_dir = self.base_dir / "data" / "split"
        self.translate_dir = self.base_dir / "data" / "translate"
        self.combine_dir = self.base_dir / "data" / "combine"
        self.result_final_dir = self.base_dir / "data" / "result"
        self.video_dir = self.base_dir / "data" / "video"      # 영상 파일(.mp4) 저장 위치
        
        # --- [2. 파일 경로 정의] ---
        self.api_file = "api.txt"
        self.rule_file = "rule.txt"
        self.gemini_ver_file = "gemini_ver.txt"
        
        # [추가] 쿠키 파일 경로 (유튜브 등 로그인 세션 유지용)
        self.cookie_file = self.base_dir/ "cookies.txt"

        # --- [3. 폴더 자동 생성] ---
        self.all_dirs = [
            self.origin_dir, self.split_dir, self.translate_dir, 
            self.combine_dir, self.result_final_dir, self.video_dir
        ]
        
        for d in self.all_dirs:
            os.makedirs(d, exist_ok=True)

    # --- [4. 유틸리티 메서드] ---
    def get_video_path(self, filename):
        """영상 저장용 전체 경로 반환"""
        return os.path.join(self.video_dir, filename)

    def get_origin_sub_path(self, filename):
        """자막 저장용 전체 경로 반환 (Origin 폴더)"""
        return os.path.join(self.origin_dir, filename)


paths = PathManager()