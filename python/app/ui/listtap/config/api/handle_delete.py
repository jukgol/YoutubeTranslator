from app.setting_service import setting_service
from app.config import app_config
import app.log as app_log
from .handle_select import load_api_list # load_api_list 추가

def delete_selected_api_key(api_combobox):
    """
    현재 app_config에 선택된 API 키를 파일에서 삭제하고 UI를 새로고침합니다.
    """
    selected_key = app_config.selected_api
    
    if not selected_key or selected_key == "없음":
        app_log.write("삭제할 API 키가 선택되지 않았습니다.")
        return

    keys = setting_service.read_api_keys()
    
    if selected_key in keys:
        new_keys = [key for key in keys if key != selected_key]
        setting_service.write_api_keys(new_keys)
        app_log.write(f"API 키가 삭제되었습니다: {selected_key[:10]}...")
        
        # UI 새로고침
        load_api_list(api_combobox)
        api_combobox.update() # 이벤트 발생 후 화면 업데이트
    else:
        app_log.write(f"삭제하려는 키를 찾을 수 없습니다: {selected_key[:10]}...")
