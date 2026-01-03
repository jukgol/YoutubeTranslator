import os
from posixpath import basename
from tkinter import messagebox
from ui import selectors
from handler.task_runner import run_async_process

# 분리한 로직 임포트
from .full_process_fucn import step_1_split, step_2_translate, step_3_combine_parts, step_4_combine_timeline

class FullProcessStep:
    def __init__(self, handler, path_service):
        self.handler = handler
        self.path_service = path_service
        self.is_stopped = False

    def request_stop(self):
        self.is_stopped = True
        self.handler.log("🛑 사용자에 의해 다음 단계 진행이 차단되었습니다.")

    def execute(self):
        #큐에 있는 파일들을 순차적으로 실제 공정 실행
        # 1. 큐 확인
        if not self.handler.queue_manager or not self.handler.queue_manager.queue:
            messagebox.showwarning("경고", "큐에 처리할 파일이 없습니다.")
            return

        # 2. 필수 정보 확인 (API 키 등)
        api_key = self.handler.api_combobox.get().strip()
        rule = self.handler.rule_text.get("1.0", "end").strip()
        model_name = self.handler.ver_entry.get().strip()

        if not api_key or not model_name:
            messagebox.showerror("오류", "API 키와 모델 버전을 확인해주세요.")
            return

        self.is_stopped = False
        self.handler.log("🚀 큐 기반 전체 공정을 시작합니다.")

        # 비동기 스레드에서 '큐 전체 순회 공정' 실행
        run_async_process(
            self.handler.app.root,
            lambda: self._run_queue_full_sequence(api_key, rule, model_name),
            self.handler.refresh_all_lists,
            self.handler.log
        )
    def execute_test(self):
        """[기존 유지] 큐에 있는 파일들을 순차적으로 순회 테스트"""
        if not self.handler.queue_manager or not self.handler.queue_manager.queue:
            from tkinter import messagebox
            messagebox.showwarning("경고", "큐에 처리할 파일이 없습니다.")
            return

        self.is_stopped = False
        self.handler.log("🧪 테스트 루프(2초 대기)를 시작합니다.")

        # 비동기 스레드에서 실행
        run_async_process(
            self.handler.app.root,
            lambda: self.handler.queue_manager.run_test_loop(
                self.handler.log, 
                lambda: self.is_stopped
            ),
            self.handler.refresh_all_lists,
            self.handler.log
        )

        # 각 파일에 대한
    def _run_sequence(self, filename, api_key, rule, model_name):
        """분리된 함수들을 사용하여 전체 공정 관리"""
        try:
            # 폴더명으로 사용할 베이스 네임 (확장자 제거)
            base_name = os.path.splitext(filename)[0]
            self.handler.log(f"🚀 '{base_name}' 전체 공정 시작")

            # --- 1단계: 원본 분리 ---
            if not step_1_split(self.handler, self.path_service, base_name, filename): return
            if self.is_stopped: return

            # --- 2단계: 번역 ---
            split_folder = self.path_service.get_split_folder_path(base_name)
            if not step_2_translate(self.handler, split_folder, api_key, rule, model_name): return
            if self.is_stopped: return

            # --- 3단계: 파트 합치기 ---
            if not step_3_combine_parts(self.handler, base_name): return
            if self.is_stopped: return

            # --- 4단계: 타임라인 결합 ---
            if not step_4_combine_timeline(self.handler, self.path_service, base_name, filename): return

            # --- 5단계: 최종 완료 ---
            self.handler.simple_tab.set_step_status(4, "done")
            self.handler.log(f"🎉 모든 공정 완료!")
            self.handler.app.root.after(0, self.handler.refresh_all_lists)

        except Exception as e:
            self.handler.log(f"❌ 통합 공정 중 치명적 에러: {str(e)}")

            # 파일 목록
    def _run_queue_full_sequence(self, api_key, rule, model_name):
        """큐를 하나씩 돌며 _run_sequence를 호출하는 실질적인 루프"""
        queue_mgr = self.handler.queue_manager
        
        for i in range(len(queue_mgr.queue)):
            if self.is_stopped:
                break
            
            # 현재 진행 상태 UI 업데이트
            queue_mgr.current_index = i
            self.handler.app.root.after(0, queue_mgr.refresh_ui)
            
            filename = queue_mgr.queue[i]
            
            # 개별 파일 공정 실행
            # (기존 _run_sequence를 그대로 재사용)
            try:
                self._run_sequence(filename, api_key, rule, model_name)
            except Exception as e:
                self.handler.log(f"❌ {filename} 처리 중 에러 발생: {e}")
                continue # 다음 파일로 넘어감

        # 모든 작업 완료 후 상태 초기화
        queue_mgr.current_index = -1
        self.handler.app.root.after(0, queue_mgr.refresh_ui)
        self.handler.log("🏁 모든 큐 작업이 완료되었습니다.")