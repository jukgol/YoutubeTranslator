# handler/steps/combine_step.py
from tkinter import messagebox
from app.ui import selectors
from ..task_runner import run_async_process
from app.logic.combine import combine_parts_logic
from app.logic.combine_timeline import combine_timeline_logic

class CombineStep:
    def __init__(self, handler, path_service):
        self.handler = handler
        self.path_service = path_service

    def execute_parts(self):
        """3. 번역 파트 합치기"""
        folder_name = self.handler.translated_listbox.get_selected()
        if not folder_name: 
            self.handler.log(f"합치기 {folder_name}가 없습니다.")
            return

        run_async_process(
            self.handler,
            self.handler.detail.refresh_combine,
            combine_parts_logic,
            folder_name, 
            self.handler.path.translate_dir,
            self.handler.path.combine_dir, 
            self.handler.log
        )

    def execute_timeline(self):
        """4. 최종 타임라인 결합"""
        filename = selectors.get_pure_filename(self.handler.combine_listbox)
        if not filename: return

        combined_path = self.path_service.get_combine_file_path(filename)
        origin_path = self.path_service.get_origin_srt_for_combine(filename)

        self.handler.log(filename)

        if not self.path_service.check_file_exists(origin_path):
            messagebox.showerror("오류", "원본 SRT를 찾을 수 없습니다.")
            return

        run_async_process(
            self.handler,
            self.handler.detail.refresh_result,
            combine_timeline_logic,
            combined_path, origin_path, 
            self.handler.path.result_final_dir, 
            self.handler.log
        )