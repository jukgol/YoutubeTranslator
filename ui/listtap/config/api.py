import flet as ft
from .components import ApiManagementRow

class ApiArea(ft.Column):
    def __init__(self, select_cmd, delete_cmd):
        super().__init__()
        # 부모(parent) 인자를 받지 않고 필요한 기능(콜백)만 전달합니다.
        self.api_row = ApiManagementRow(select_cmd, delete_cmd)
        
        self.controls = [self.api_row]
        
        # Handler가 찾기 쉽게 참조만 연결해둡니다.
        self.api_combobox = self.api_row.combo
        self.api_entry = self.api_row.entry