import flet as ft
from app.setting_service import setting_service
import app.log as app_log
from app.config import app_config

def set_api_list(api_combobox, keys):
    """지정된 combobox의 목록을 업데이트합니다."""
    api_combobox.options = [ft.dropdown.Option(k) for k in (keys if keys else ["없음"])]
    api_combobox.value = keys[0] if keys else "없음"

def load_api_list(api_combobox):
    """키 목록을 읽고 UI에 반영합니다."""
    keys = setting_service.read_api_keys()
    app_config.api_keys = keys
    app_config.selected_api = keys[0] if keys else None
    set_api_list(api_combobox, keys)

def handle_select(api_combobox, selected):
    """선택 이벤트를 처리하고 UI를 새로고침합니다."""
    if not selected or selected == "없음": 
        return
    app_config.selected_api = selected
    new_keys = setting_service.get_reordered_keys(selected)
    setting_service.write_api_keys(new_keys)
    load_api_list(api_combobox)
    app_log.write(f"API Key 선택됨: {selected[:10]}...")

def on_api_select(api_combobox, e=None):
    """ 
    API 키 선택 이벤트 핸들러.
    Flet Dropdown 위젯을 인자로 받습니다.
    """
    selected = api_combobox.value
    handle_select(api_combobox, selected)
    api_combobox.update() # 이벤트 발생 후 화면 업데이트
def on_check_usage(e=None):
    """ API 사용량 확인 이벤트 핸들러 """
    # api_key = self.api_combobox.value.strip() if self.api_combobox.value else ""
    # self.handler.setting.check_api_usage(api_key)
    print("on_check_usage 호출됨 - 로직 구현 필요")
    pass
