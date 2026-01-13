import flet as ft
from .api import ApiArea
from .version import VersionArea
from .rule import RuleArea

class ConfigSection(ft.Column):
    def __init__(self):
        super().__init__()
        self.spacing = 1
        self.handler = None
        # 1. 컴포넌트 생성 (그릇 만들기)
        self.api_area = ApiArea(select_cmd=self._on_api_select, delete_cmd=self._on_api_add)
        self.version_area = VersionArea(save_cmd=self._on_config_save, check_cmd=self._on_check_usage)
        self.rule_area = RuleArea(save_cmd=self._on_config_save)

        # 2. 위젯 참조 유지
        self.api_combobox = self.api_area.api_combobox
        self.api_entry = self.api_area.api_entry
        self.ver_entry = self.version_area.ver_entry
        self.remaining_label = self.version_area.remaining_label
        self.rule_text = self.rule_area.rule_text

        # 3. 레이아웃 조립
        self._build_layout()

    def _build_layout(self):
        self.expand = True  # 섹션 전체가 창 크기에 맞춰 확장되도록 설정
        
        self.controls = [
            ft.Text(" 설정 (자동 저장됨) ", weight=ft.FontWeight.BOLD, size=14),
            ft.Container(
                content=ft.Column([
                    self.api_area,
                    ft.Divider(height=1, color=ft.Colors.OUTLINE_VARIANT),
                    self.version_area,
                    self.rule_area, # 여기서 RuleArea가 남은 모든 공간을 다 쓰게 됨
                ], 
                spacing=10, 
                expand=True # 컨테이너 내부 컬럼이 창 크기에 맞춰 늘어나도록 함
                ),
                border=ft.border.all(1, ft.Colors.OUTLINE),
                border_radius=8,
                padding=15,
                expand=True, # 컨테이너도 부모 공간을 꽉 채움
            )
        ]

    def setup_handler(self, h):
        """
        [표준화] 다른 탭들과 형식을 맞추기 위해 핸들러 등록 로직을 이리로 모았습니다.
        이제 중앙 제어 장치가 이 함수만 실행하면 배선이 끝납니다.
        """
        self.handler = h

        h.ui_set_api_list = self.set_api_list
        h.ui_set_config_data = self.set_config_data
        h.ui_update_usage_status = self.update_usage_status
        h.ui_clear_api_input = self.clear_api_input
        
        print("✅ ConfigSection: 핸들러 및 인터페이스 배선 완료")

    # --- [사용자님이 작성하신 Push/Callback 로직은 그대로 유지] ---
    def _on_config_save(self, e=None):
        version = self.ver_entry.value.strip() if self.ver_entry.value else ""
        rule = self.rule_text.value.strip() if self.rule_text.value else ""
        self.handler.setting.save(version, rule)

    def _on_api_add(self, e=None):
        new_key = self.api_entry.value.strip() if self.api_entry.value else ""
        self.handler.setting.add_api_key(new_key)
        self.clear_api_input()

    def _on_api_select(self, e=None):
        selected = self.api_combobox.value
        self.handler.setting.handle_select(selected)

    def _on_check_usage(self, e=None):
        api_key = self.api_combobox.value.strip() if self.api_combobox.value else ""
        self.handler.setting.check_api_usage(api_key)

    def _safe_update(self):
        """Call update(), but ignore if control is not yet added to the page."""
        try:
            self.update()
        except AssertionError:
            # Control not added to page yet; ignore and continue
            return

    def set_config_data(self, version, rule):
        self.ver_entry.value = version
        self.rule_text.value = rule
        self._safe_update()

    def set_api_list(self, keys):
        self.api_combobox.options = [ft.dropdown.Option(k) for k in (keys if keys else ["없음"])]
        self.api_combobox.value = keys[0] if keys else "없음"
        self._safe_update()

    def clear_api_input(self):
        self.api_entry.value = ""
        self._safe_update()

    def update_usage_status(self, text, status_type="normal"):
        colors = {"normal": ft.Colors.BLUE, "error": ft.Colors.RED, "success": ft.Colors.GREEN_700}
        self.remaining_label.value = text
        self.remaining_label.color = colors.get(status_type, ft.Colors.BLACK)
        self._safe_update()