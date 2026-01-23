import flet as ft
from .layout import Layout

class Component:
    def __init__(self):
        self.ui = Layout(save_cmd=None, check_cmd=None)

    def _safe_update(self):
        """Call update(), but ignore if control is not yet added to the page."""
        try:
            self.ui.update()
        except AssertionError:
            # Control not added to page yet; ignore and continue
            return

    def set_version(self, version):
        self.ui.ver_entry.value = version
        self._safe_update()

    def update_usage_status(self, text, status_type="normal"):
        colors = {"normal": ft.Colors.BLUE, "error": ft.Colors.RED, "success": ft.Colors.GREEN_700}
        self.ui.remaining_label.value = text
        self.ui.remaining_label.color = colors.get(status_type, ft.Colors.BLACK)
        self._safe_update()
