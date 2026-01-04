import os

class PathManager:
    def __init__(self):
        # --- [1. 폴더 경로 정의] ---
        self.origin_dir = os.path.join(os.getcwd(), "data/origin")       # 자막 다운로드 및 원본 자막 위치
        self.split_dir = os.path.join(os.getcwd(), "data/split")
        self.translate_dir = os.path.join(os.getcwd(), "data/translate")
        self.combine_dir = os.path.join(os.getcwd(), "data/combine")
        self.result_final_dir = os.path.join(os.getcwd(), "data/result")
        self.video_dir = os.path.join(os.getcwd(), "data/video")         # 영상 파일(.mp4) 저장 위치
        
        # --- [2. 파일 경로 정의] ---
        self.api_file = "api.txt"
        self.rule_file = "rule.txt"
        self.gemini_ver_file = "gemini_ver.txt"
        
        # [추가] 쿠키 파일 경로 (유튜브 등 로그인 세션 유지용)
        self.cookie_file = os.path.join(os.getcwd(), "cookies.txt")

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