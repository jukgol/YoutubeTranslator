from app.setting_service import setting_service
import app.log as app_log

def save_rule(rule_value):
    """번역 규칙 값을 받아 설정에 저장합니다."""
    setting_service.save_rule(rule_value)
    app_log.write("번역 규칙이 저장되었습니다.")

def on_rule_save(rule_text_widget, e=None):
    """
    번역 규칙 입력 필드의 blur 이벤트 핸들러.
    Flet TextField 위젯을 인자로 받습니다.
    """
    rule_value = rule_text_widget.value.strip() if rule_text_widget.value else ""
    save_rule(rule_value)
    # rule_text_widget.update() # 필요한 경우 UI 업데이트 추가
