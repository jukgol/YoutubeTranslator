import flet as ft
from .layout import Layout
from .handle_add import on_api_add
from .handle_delete import delete_selected_api_key
from .handle_select import on_api_select, load_api_list # load_api_list 추가

class ApiComponent:
    def __init__(self):
        # Create layout instance
        self.ui = Layout()
        
        # Setup event handlers
        self._setup_handlers()

        # Load initial data
        self.load()        

    def _setup_handlers(self):
        """이벤트 핸들러를 UI 컨트롤에 직접 연결합니다."""
        # '새 Key 추가'의 TextField에서 Enter를 누를 때
        self.ui.api_entry.on_submit = lambda e: on_api_add(self.ui.api_entry, self.ui.api_combobox, e)
        
        # '선택 삭제' 버튼을 클릭할 때
        self.ui.api_row.delete_btn.on_click = lambda e: delete_selected_api_key(self.ui.api_combobox)

        # Dropdown에서 다른 키를 선택할 때
        self.ui.api_combobox.on_change = lambda e: on_api_select(self.ui.api_combobox, e)

    def load(self):
        """컴포넌트 초기 로드 시 API 키 목록을 불러와 UI에 반영합니다."""
        load_api_list(self.ui.api_combobox)
