# handler/detail.py
import os
from app.path_service import SubtitlePathService
from .steps.split_step import SplitStep
from .steps.translate_step import TranslateStep
from .steps.combine_step import CombineStep

class Detail:
    def __init__(self, handler):
        self.handler = handler
        self.path_service = SubtitlePathService(handler.path)
        self.tab = None
        
        # 담당자들을 각각 생성하여 할당
        self.split_step = SplitStep(handler, self.path_service)
        self.translate_step = TranslateStep(handler, self.path_service)
        self.combine_step = CombineStep(handler, self.path_service)

    # 단순 연결 (Delegation)
    def handle_split(self):
        self.split_step.execute()

    def handle_translate(self):
        self.translate_step.execute_translate()

    def handle_test(self):
        self.translate_step.execute_test()

    def handle_combine_parts(self):
        self.combine_step.execute_parts()

    def handle_combine_timeline(self):
        self.combine_step.execute_timeline()

    def update_file_list_widget(self, widget, folder_path):
        """특정 폴더의 파일 목록을 읽어 SmartListPanel에 채웁니다."""
        if not os.path.exists(folder_path):
            return
            
        # 1. 폴더 내 파일 목록 가져오기
        try:
            files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
            files.sort() # 가나다순 정렬
        except Exception as e:
            print(f"폴더 읽기 오류: {e}")
            return

        # 2. SmartListPanel에 내장된 set_list 함수 사용
        # widget(SmartListPanel)이 이미 가지고 있는 기능을 활용합니다.
        widget.set_list(files)

    def update_folder_list_widget(self, widget, folder_path):
        """특정 폴더 내의 '하위 폴더' 목록만 읽어 SmartListPanel에 채웁니다."""
        if not os.path.exists(folder_path):
            return
            
        try:
            # os.path.isdir을 사용하여 폴더(디렉토리)만 골라냅니다.
            folders = [f for f in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, f))]
            folders.sort()
            widget.set_list_folder(folders, folder_path)
        except Exception as e:
            print(f"폴더 읽기 오류 (Folders): {e}")

    def initialize_tab_lists(self, tab):
        """앱 시작 시 UI 객체를 등록하고 모든 리스트를 한 번 최신화합니다."""
        self.tab = tab 
        
        # 초기화 시 5개 리스트를 모두 갱신
        self.refresh_origin()
        self.refresh_split()
        self.refresh_translate()
        self.refresh_combine()
        self.refresh_result()

    def refresh_all(self):
        self.refresh_origin()
        self.refresh_split()
        self.refresh_translate()
        self.refresh_combine()
        self.refresh_result()
    # --- 5단계 리스트별 전용 호출 함수 (파라미터 없음) ---

    def refresh_origin(self):
        """1단계: 파일 표시"""
        if self.tab:
            self.update_file_list_widget(self.tab.origin_list, self.handler.path.origin_dir)

    def refresh_split(self):
        """2단계: 폴더 표시 (수정됨)"""
        if self.tab:
            self.update_folder_list_widget(self.tab.split_list, self.handler.path.split_dir)

    def refresh_translate(self):
        """3단계: 폴더 표시 (수정됨)"""
        if self.tab:
            self.update_folder_list_widget(self.tab.translated_list, self.handler.path.translate_dir)

    def refresh_combine(self):
        """4단계: 파일 표시"""
        if self.tab:
            self.update_file_list_widget(self.tab.combine_list, self.handler.path.combine_dir)

    def refresh_result(self):
        """5단계: 파일 표시"""
        if self.tab:
            self.update_file_list_widget(self.tab.result_list, self.handler.path.result_final_dir)