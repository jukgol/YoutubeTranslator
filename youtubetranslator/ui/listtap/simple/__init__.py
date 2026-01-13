import flet as ft
from .layout import setup_simple_layout
from .events import connect_simple_events

class SimpleTab(ft.Column):
    def __init__(self):
        super().__init__()
        self.expand = True
        self.process_labels = [] # layout.py에서 생성된 라벨들이 담길 리스트

        # 1. UI 그리기 (그릇 만들기)
        # 이제 __init__에서는 레이아웃만 잡고, 배선(Handler)은 기다립니다.
        setup_simple_layout(self)
        self.on_active = None

    def setup_handler(self, h):
        """
        [리팩토링 핵심] 흩어져 있던 핸들러 관련 배선을 이 곳으로 모두 모았습니다.
        중앙 register_handler 함수에 의해 호출됩니다.
        """
        # A. 핸들러에 UI 제어 창구 및 위젯 등록 (Logic <-> UI)
        h.ui_update_simple_status = self.set_step_status
        h.simple_origin_list = self.origin_list 
        h.simple_result_list = self.result_list
        h.simple_queue_list = self.queue_list # 큐 리스트도 핸들러가 알아야 하므로 추가

        # B. 버튼 이벤트 연결 (UI -> Logic)
        # 외부 events.py의 기능을 여기서 호출하여 배선을 완료합니다.
        connect_simple_events(self, h)
        
        print("✅ SimpleTab: 핸들러 및 이벤트 배선 완료")

    def set_step_status(self, index, status="active"):
        """로직 결과에 따라 UI 상태(라벨 색상)를 변경하는 인터페이스 메서드"""
        colors = {
            "active": (ft.colors.BLACK, ft.colors.YELLOW_300), 
            "done": (ft.colors.GREEN_700, ft.colors.TRANSPARENT), 
            "error": (ft.colors.RED, ft.colors.TRANSPARENT),
            "idle": (ft.colors.GREY_400, ft.colors.TRANSPARENT)
        }
        
        if 0 <= index < len(self.process_labels):
            fg, bg = colors.get(status, (ft.colors.BLACK, ft.colors.TRANSPARENT))
            target_container = self.process_labels[index]
            target_text = target_container.content 
            
            target_container.bgcolor = bg
            target_text.color = fg
            target_container.update()

# 큐 렌더링 함수 (변경 없음)
def render_queue_to_widget(widget, queue_items, current_index):    
    if not widget:         
        return

    widget.clear()

    for i, filename in enumerate(queue_items):
        # 1. 상태 판별 로직
        if i < current_index:
            # 완료 상태
            icon = "✅"
            status_text = "(완료)"
            text_color = ft.colors.GREY_500 # 지나간 항목은 회색 처리하면 가독성이 좋아짐
        elif i == current_index:
            # 작업 중 상태
            icon = "▶️"
            status_text = "(작업중)"
            text_color = ft.colors.BLUE_ACCENT
        else:
            # 대기 중 상태
            icon = "⏳"
            status_text = "(대기중)"
            text_color = ft.colors.BLACK

        # 2. 텍스트 조립 및 추가
        t = f"{icon} {filename} {status_text}\n---------"
        
        # SmartListPanel의 add 메서드에 색상 옵션이 있다면 같이 넘겨주면 좋습니다.
        widget.add(t, color=text_color)
    
    widget.update()