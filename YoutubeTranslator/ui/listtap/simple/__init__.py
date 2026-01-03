import flet as ft
from .layout import setup_simple_layout
# from .events import connect_simple_events # 나중에 연결

class SimpleTab(ft.Column):
    def __init__(self, handler):
        super().__init__()
        self.handler = handler
        self.expand = True
        self.process_labels = [] # layout.py에서 생성된 라벨(Container)들이 담길 리스트

        # 1. UI 그리기 (Flet 버전 layout.py 호출)
        setup_simple_layout(self)
        
        # 2. 핸들러에 UI 제어 창구 등록
        self._register_to_handler()
        
        # 3. 버튼 이벤트 연결 (나중에 진행)
        # connect_simple_events(self)

    def _register_to_handler(self):
        """핸들러가 이 탭의 위젯을 조작할 수 있도록 함수 등록"""
        h = self.handler
        h.ui_update_simple_status = self.set_step_status
        h.simple_origin_list = self.origin_list 
        h.simple_result_list = self.result_list

    def set_step_status(self, index, status="active"):
        """로직 결과에 따라 UI 상태(라벨 색상)를 변경하는 인터페이스 메서드"""
        # Flet 대응 색상 테이블
        colors = {
            "active": (ft.colors.BLACK, ft.colors.YELLOW_300), 
            "done": (ft.colors.GREEN_700, ft.colors.TRANSPARENT), 
            "error": (ft.colors.RED, ft.colors.TRANSPARENT),
            "idle": (ft.colors.GREY_400, ft.colors.TRANSPARENT)
        }
        
        if 0 <= index < len(self.process_labels):
            fg, bg = colors.get(status, (ft.colors.BLACK, ft.colors.TRANSPARENT))
            
            # Flet에서 배경색을 바꾸려면 해당 위젯이 ft.Container여야 합니다.
            # layout.py에서 라벨을 Container로 감싸서 생성할 예정입니다.
            target_container = self.process_labels[index]
            target_text = target_container.content # Container 안의 Text 위젯
            
            target_container.bgcolor = bg
            target_text.color = fg
            
            target_container.update()

def render_queue_to_widget(widget, queue_items, current_index):    
    if not widget:
        return

    # Flet TextField는 Tag(강조색) 기능이 Tkinter처럼 자유롭지 않습니다.
    # 가장 쉬운 1:1 대응 방법은 강조 항목 앞에 "▶" 같은 표시를 붙이는 것입니다.
    lines = []
    for i, filename in enumerate(queue_items):
        if i == current_index:
            lines.append(f"▶ {filename} (작업중)")
        else:
            lines.append(f"  {filename}")
        lines.append("-" * 30)
    
    widget.value = "\n".join(lines)
    widget.update()
    
    # 최신 항목으로 스크롤 (Flet의 scroll_to)
    # widget.scroll_to(offset=-1, duration=300) # 필요시 사용