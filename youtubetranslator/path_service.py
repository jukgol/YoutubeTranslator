# app/path_service.py
import os
import platform
import subprocess
import shutil

class SubtitlePathService:
    def __init__(self, data_manager):
        """PathManager를 주입받아 설정된 기본 경로들을 활용합니다."""
        self.path = data_manager

    def get_origin_path(self, filename):
        """1번 원본 목록에서 선택된 파일의 전체 경로를 반환합니다."""
        if not filename: return None
        return os.path.join(self.path.origin_dir, filename)

    def get_split_folder_path(self, folder_name):
        """2번 스플릿 목록에서 선택된 폴더의 전체 경로를 반환합니다."""
        if not folder_name: return None
        return os.path.join(self.path.split_dir, folder_name)

    def get_translate_folder_path(self, folder_name):
        """3번 번역 목록에서 선택된 폴더의 전체 경로를 반환합니다."""
        if not folder_name: return None
        return os.path.join(self.path.translate_dir, folder_name)

    def get_combine_file_path(self, filename):
        """4번 합치기 목록에서 선택된 파일의 전체 경로를 반환합니다."""
        if not filename: return None
        return os.path.join(self.path.combine_dir, filename)

    def get_origin_srt_for_combine(self, combine_filename):
        """
        4번 단계에서 최종 결합을 위해 원본 SRT 경로를 추적합니다.
        예: '타이틀.txt' -> '타이틀.srt'
        """
        if not combine_filename: return None
        origin_name = os.path.splitext(combine_filename)[0] + ".srt"
        return os.path.join(self.path.origin_dir, origin_name)

    def check_file_exists(self, path):
        """경로에 실제 파일이나 폴더가 존재하는지 확인합니다."""
        return os.path.exists(path) if path else False    

def get_folder_files(folder_path, extensions=None, exclude=None):
    """
    지정된 폴더 내의 파일 목록을 반환합니다.
    :param extensions: 포함할 확장자 튜플 (예: ('.mp4', '.mkv'))
    :param exclude: 제외할 확장자 튜플 (예: ('.srt',))
    """
    if not os.path.exists(folder_path):
        return []
    
    # 기본적으로 파일인 것만 추출
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    
    # 1. 특정 확장자만 보기 (Whitelist)
    if extensions:
        files = [f for f in files if f.lower().endswith(extensions)]
        
    # 2. 특정 확장자 제외하기 (Blacklist)
    if exclude:
        files = [f for f in files if not f.lower().endswith(exclude)]
        
    return sorted(files)

def copy_file_to_folder(source_file_path, target_folder_path):
    """파일을 지정된 폴더로 복사합니다."""    
    try:
        if not os.path.isfile(source_file_path):
            return False, "원본 파일을 찾을 수 없습니다."
        
        # 목적지 폴더가 없으면 생성
        if not os.path.exists(target_folder_path):
            os.makedirs(target_folder_path, exist_ok=True)
            
        # 파일 복사 실행 (copy2는 메타데이터도 유지)
        shutil.copy2(source_file_path, target_folder_path)
        return True, "복사 성공"
    except Exception as e:
        return False, str(e)

def open_folder_in_explorer(folder_path):
    if not os.path.exists(folder_path):
        return False, f"폴더가 존재하지 않습니다: {folder_path}"

    try:
        if platform.system() == "Windows":
            os.startfile(folder_path)
        elif platform.system() == "Darwin": # macOS
            subprocess.run(["open", folder_path])
        else: # Linux
            subprocess.run(["xdg-open", folder_path])
        return True, "성공"
    except Exception as e:
        return False, str(e)