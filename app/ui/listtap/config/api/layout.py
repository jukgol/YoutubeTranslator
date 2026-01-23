import flet as ft
from .row import ApiManagementRow


class Layout(ft.Column):
    def __init__(self):
        super().__init__()
        self.api_row = ApiManagementRow()
        
        self.controls = [self.api_row]
        
        self.api_combobox = self.api_row.combo
        self.api_entry = self.api_row.entry