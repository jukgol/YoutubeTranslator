from app.setting_service import setting_service
import app.log as app_log
from .handle_select import load_api_list # load_api_list 추가

def clear_api_input(api_entry_widget):
    """지정된 api_entry 위젯의 값을 비웁니다."""
    api_entry_widget.value = ""
    # 참고: UI 업데이트를 위해서는 위젯의 update() 호출이 필요할 수 있습니다.
    # 예: api_entry_widget.update()

def add_api_key(new_key):
    """새로운 키를 인자로 받아 추가 로직 수행"""
    if not new_key: 
        return
    
    new_keys = setting_service.get_added_keys(new_key)
    setting_service.write_api_keys(new_keys)
    
    app_log.write(f"새 API 키가 추가되었습니다: {new_key[:10]}...")

def on_api_add(api_entry_widget, api_combobox, e=None):
    """ 
    API 키 추가 이벤트 핸들러.
    Flet TextField 위젯과 Dropdown 위젯을 인자로 받습니다.
    """
    new_key = api_entry_widget.value.strip() if api_entry_widget.value else ""
    if not new_key:
        return

    # 핵심 로직 호출
    add_api_key(new_key)
    
    # 입력 필드 비우기
    clear_api_input(api_entry_widget)

    # API 목록 UI 새로고침
    load_api_list(api_combobox)
    api_combobox.update() # 이벤트 발생 후 화면 업데이트
