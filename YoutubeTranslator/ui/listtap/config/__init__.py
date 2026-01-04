import flet as ft
from .api import ApiArea
from .version import VersionArea
from .rule import RuleArea

class ConfigSection(ft.Column):
    def __init__(self, handler):
        super().__init__()
        self.handler = handler
        self.spacing = 5  # 섹션 간 간격

        # 1. 컴포넌트 생성 (부모 인자 생략)
        self.api_area = ApiArea(
            select_cmd=self._on_api_select, 
            delete_cmd=self._on_api_add
        )
        
        self.version_area = VersionArea(
            save_cmd=self._on_config_save, 
            check_cmd=self._on_check_usage
        )
        
        self.rule_area = RuleArea(
            save_cmd=self._on_config_save
        )

        # 2. 위젯 참조 유지 (기존 핸들러 호환성)
        self.api_combobox = self.api_area.api_combobox
        self.api_entry = self.api_area.api_entry
        self.ver_entry = self.version_area.ver_entry
        self.remaining_label = self.version_area.remaining_label
        self.rule_text = self.rule_area.rule_text

        # 3. 레이아웃 조립 (LabelFrame 느낌 구현)
        self.controls = [
            ft.Text(" 설정 (자동 저장됨) ", weight=ft.FontWeight.BOLD, size=14),
            ft.Container(
                content=ft.Column([
                    self.api_area,
                    ft.Divider(height=1, color=ft.Colors.OUTLINE_VARIANT), # 구분선 추가
                    self.version_area,
                    self.rule_area,
                ], spacing=10),
                border=ft.border.all(1, ft.Colors.OUTLINE),
                border_radius=8,
                padding=15,
            )
        ]

        # 4. [핵심] 핸들러 등록 (기존 로직 1:1 유지)
        self.handler.ui_set_api_list = self.set_api_list
        self.handler.ui_set_config_data = self.set_config_data
        self.handler.ui_update_usage_status = self.update_usage_status
        self.handler.ui_clear_api_input = self.clear_api_input

    # --- [데이터 추출 및 핸들러 호출부 (Push)] ---

    def _on_config_save(self, e=None):
        """Flet TextField는 .value로 값을 가져옵니다."""
        version = self.ver_entry.value.strip() if self.ver_entry.value else ""
        rule = self.rule_text.value.strip() if self.rule_text.value else ""
        self.handler.setting.save(version, rule)

    def _on_api_add(self, e=None):
        new_key = self.api_entry.value.strip() if self.api_entry.value else ""
        self.handler.setting.add_api_key(new_key)
        self.clear_api_input()

    def _on_api_select(self, e=None):
        """Dropdown의 선택값은 .value에 저장됩니다."""
        selected = self.api_combobox.value
        self.handler.setting.handle_select(selected)

    def _on_check_usage(self, e=None):
        api_key = self.api_combobox.value.strip() if self.api_combobox.value else ""
        self.handler.setting.check_api_usage(api_key)

    # --- [핸들러가 호출하는 인터페이스 (Callback)] ---

    def set_config_data(self, version, rule):
        self.ver_entry.value = version
        self.rule_text.value = rule
        self.update() # Flet은 값 변경 후 update() 필수

    def set_api_list(self, keys):
        # Dropdown 옵션 갱신
        self.api_combobox.options = [ft.dropdown.Option(k) for k in (keys if keys else ["없음"])]
        self.api_combobox.value = keys[0] if keys else "없음"
        self.update()

    def clear_api_input(self):
        self.api_entry.value = ""
        self.update()

    def update_usage_status(self, text, status_type="normal"):
        colors = {
            "normal": ft.Colors.BLUE, 
            "error": ft.Colors.RED, 
            "success": ft.Colors.GREEN_700
        }
        self.remaining_label.value = text
        self.remaining_label.color = colors.get(status_type, ft.Colors.BLACK)
        self.update()