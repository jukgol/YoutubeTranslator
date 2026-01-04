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

    def initialize_tab_lists(self, tab):
        """앱 시작 시 Detail 탭의 5단계 리스트를 각각의 폴더와 연결하여 초기화합니다."""
        # UIHandlers로부터 전달받은 path 객체 사용
        paths = self.handler.path
        
        # 1. 원본 리스트 (data/origin)
        self.update_file_list_widget(tab.origin_list, paths.origin_dir)
        
        # 2. 스플릿 리스트 (data/split)
        self.update_file_list_widget(tab.split_list, paths.split_dir)
        
        # 3. 번역 리스트 (data/translate)
        self.update_file_list_widget(tab.translated_list, paths.translate_dir)
        
        # 4. 합치기 리스트 (data/combine)
        self.update_file_list_widget(tab.combine_list, paths.combine_dir)
        
        # 5. 결과 리스트 (data/result)
        self.update_file_list_widget(tab.result_list, paths.result_final_dir)