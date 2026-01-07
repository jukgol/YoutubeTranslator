# handler/steps/translate_step.py
from tkinter import messagebox
from ui import selectors
from handler.task_runner import run_async_process
from logic import translate_test_logic
from .translate_queue import process_folder_queue

class TranslateStep:
    def __init__(self, handler, path_service):
        self.handler = handler
        self.path_service = path_service
        self.config = handler.config

    def execute_translate(self):
        """2. Gemini 번역 실행"""
        api_key = self.config.selected_api
        rule = self.config.prompt_rule
        model_name = self.config.model_version
        foldername = self.handler.split_listbox.get_selected()
        
        if not api_key or not model_name:
            messagebox.showerror("오류", "API 키와 모델 버전을 확인해주세요.")
            return
        if not foldername:
            messagebox.showwarning("경고", f"{foldername}번역할 폴더를 정확히 클릭하세요.")
            return

        resultfolder = self.path_service.get_split_folder_path(foldername)
        self.handler.log(f"--- {foldername} 번역 시작 (모델: {model_name}) ---")
        
        run_async_process(
            self.handler,
            self.handler.detail.refresh_translate,            
            process_folder_queue,
            resultfolder, api_key, rule, model_name,
            self.handler.log, self.handler.update_timer_log
        )

    def execute_test(self):
        """번역 테스트 실행"""
        filename = selectors.get_pure_filename(self.handler.split_listbox)
        if not filename: return
        
        file_path = self.path_service.get_split_folder_path(filename)
        run_async_process(
            self.handler.page,
            self.handler.detail.refresh_translate,
            translate_test_logic,
            file_path, 
            self.handler.log, 
            self.handler.update_timer_log
        )