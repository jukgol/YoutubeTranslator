# handler/steps/split_step.py
from tkinter import messagebox
from ui import selectors
from handler.task_runner import run_async_process
from logic import split_subtitle_logic

class SplitStep:
    def __init__(self, handler, path_service):
        self.handler = handler
        self.path_service = path_service

    def execute(self):
        """1. 원본 파일 분리 실행"""
        filename = selectors.get_pure_filename(self.handler.origin_listbox)
        if not filename:
            messagebox.showwarning("경고", "분리할 원본 파일을 정확히 클릭하세요.")
            return
            
        file_path = self.path_service.get_origin_path(filename)
        self.handler.log(f"--- {filename} 분리 시작 ---")
        
        run_async_process(
            self.handler.app.root,
            lambda: split_subtitle_logic(file_path, self.handler.path.origin_dir, self.handler.log),
            self.handler.refresh_all_lists,
            self.handler.log
        )