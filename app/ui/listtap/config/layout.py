import flet as ft

class ConfigLayout(ft.Column):
    def __init__(self, component):
        super().__init__()
        self.spacing = 1
        self._component = component # Store component for _build_layout

        # 1. 레이아웃 조립
        self._build_layout()

    def _build_layout(self):
        self.expand = True

        self.controls = [
            ft.Text(" 설정 (자동 저장됨) ", weight=ft.FontWeight.BOLD, size=14),
            ft.Container(
                content=ft.Column([
                    self._component.api.ui,
                    ft.Divider(height=1, color=ft.Colors.OUTLINE_VARIANT),
                    self._component.version.ui,
                    self._component.rule.ui,
                ], 
                spacing=10, 
                expand=True
                ),
                border=ft.border.all(1, ft.Colors.OUTLINE),
                border_radius=8,
                padding=15,
                expand=True,
            )
        ]
