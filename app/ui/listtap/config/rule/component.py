from .layout import Layout

class Component:
    def __init__(self):
        self.ui = Layout(save_cmd=None)

    def _safe_update(self):
        """Call update(), but ignore if control is not yet added to the page."""
        try:
            self.ui.update()
        except AssertionError:
            # Control not added to page yet; ignore and continue
            return

    def set_rule(self, rule):
        self.ui.rule_text.value = rule
        self._safe_update()
