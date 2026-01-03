# handler/task_runner.py

def run_async_process(app_root, logic_func, refresh_callback, log_callback):
    def wrapper():
        try:
            logic_func()
            # 성공 시 콜백 실행
            app_root.after(0, refresh_callback)
        except Exception as e:
            # [수정 포인트] e의 내용을 즉시 문자열(error_msg)로 복사해둡니다.
            error_msg = str(e)
            # 이제 lambda는 사라진 'e' 대신 안전하게 저장된 'error_msg'를 사용합니다.
            app_root.after(0, lambda: log_callback(f"❌ 작업 중 치명적 오류: {error_msg}"))

    import threading
    threading.Thread(target=wrapper, daemon=True).start()