from app.setting_service import setting_service
import app.log as app_log
from app.config import app_config # api_key를 위해 필요

def save_version(version_value):
    """버전 값을 받아 설정에 저장합니다."""
    setting_service.save_version(version_value)
    app_log.write(f"버전 정보가 저장되었습니다: {version_value}")

def on_version_save(ver_entry_widget, e=None):
    """
    버전 입력 필드의 blur 이벤트 핸들러.
    Flet TextField 위젯을 인자로 받습니다.
    """
    version_value = ver_entry_widget.value.strip() if ver_entry_widget.value else ""
    save_version(version_value)    
