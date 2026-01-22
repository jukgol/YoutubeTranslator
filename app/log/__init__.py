# app/log/__init__.py

import queue
from .manager import _LogManager
from .executor import create_executor
from .section import create_section
from .handler import create_handler

print("🚀 [Log Package] 로드됨")

# 1. 로그 매니저를 미리 생성
_manager = _LogManager()

# 2. 각 컴포넌트를 생성하고 매니저에 등록하는 함수들
def init_log_components(page):
    """
    Log 시스템의 모든 컴포넌트(핸들러, 큐, 섹션, 실행기)를 생성하고 연결합니다.
    """
    print("✅ [Log] init_log_components() 호출됨: 시스템 초기화 시작")
    
    print("  - 큐(Queue) 매니저에서 가져옴 완료")
    
    # 생성 함수를 호출하여 인스턴스를 만들고 매니저에 저장
    _manager.handler = create_handler(_manager.log_queue)
    print("  - 핸들러(Handler) 생성 완료")
    
    _manager.section = create_section()
    print("  - UI 섹션(Section) 생성 완료")
    
    _manager.executor = create_executor(page)
    print("  - 실행기(Executor) 생성 완료")
    
    # 3. 생성된 컴포넌트들끼리 파라미터 전달 (연결)
    print("  - 실행기(Executor)와 UI(Section) 연결 중...")
    _manager.executor.start(printer=_manager.section.printer, log_queue=_manager.log_queue)
    print("✅ [Log] 모든 컴포넌트 생성 및 연결 완료!")


# --- 외부에서 사용할 인터페이스 ---

def get_section_ui():
    """초기 UI 구성을 위해 Section 객체를 반환"""
    print("ℹ️ [Log] get_section_ui() 호출됨")
    return _manager.section

def get_log_queue():
    """핸들러 로직에 전달할 큐 객체를 반환"""
    print("ℹ️ [Log] get_log_queue() 호출됨")
    return _manager.log_queue

# log.write() 처럼 직접 사용하게 될 핵심 기능(메서드) 노출
# 이 부분은 _manager.handler가 초기화 된 후에만 가능하므로,
# init_log_components가 호출되었다고 가정하고 정의합니다.
# 더 안전한 방법은 이 함수들을 매니저에 직접 두는 것입니다.
def write(message, replace=False):
    if _manager.handler:
        _manager.handler.log(message, replace=replace)
    else:
        print("[경고] 로그 핸들러가 아직 초기화되지 않았습니다.")

def update_timer(message):
    if _manager.handler:
        _manager.handler.update_timer(message)
    else:
        print("[경고] 로그 핸들러가 아직 초기화되지 않았습니다.")

def clear():
    if _manager.handler:
        _manager.handler.clear()
    else:
        print("[경고] 로그 핸들러가 아직 초기화되지 않았습니다.")

print("🚀 [Log Package] 모든 함수 및 인터페이스 정의 완료")
