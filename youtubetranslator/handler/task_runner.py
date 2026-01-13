# handler/task_runner.py

def run_async_process(handler, updateUI, logic_func,  *args):    
    """
    logic_func: 실행할 비동기 로직 (함수 이름)
    on_complete: 로직 종료 후 실행할 콜백 함수 (UI 업데이트 등)
    *args: logic_func에 전달할 인자들
    """
    async def internal_wrapper():
        try:
            # 1. 순수 로직 실행 (전달받은 인자들을 여기서 풂)
            await logic_func(*args)

            # 2. 로직이 에러 없이 종료되면 콜백 실행
            if updateUI:
                updateUI()

        except asyncio.CancelledError:
            # 태스크가 외부에서 취소되면 조용히 종료
            handler.log("⚠️ 작업이 취소되었습니다.")
            return
        except Exception as e:
            # 로직 실행 중 에러 발생 시 로그 출력
            error_msg = str(e)
            handler.log(f"❌ 작업 중 치명적 오류: {error_msg}")

    # Flet의 비동기 태스크로 래퍼를 실행
    handler.page.run_task(internal_wrapper)    