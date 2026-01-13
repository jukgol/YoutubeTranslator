import flet as ft

class LogPanel(ft.Container):
    """
    [성능 최적화형] 업데이트 제어권을 외부(Executor)로 넘긴 로그 패널
    모든 메서드에서 self.list_view.update()를 제거했습니다.
    """
    def __init__(self, **kwargs):
        # 내부에서 실제로 글자가 쌓일 리스트뷰
        self.list_view = ft.ListView(
            expand=True,
            spacing=5,
            auto_scroll=True,
        )
        
        # 부모인 Container(하얀 박스) 설정
        super().__init__(
            content=self.list_view,
            bgcolor=ft.colors.WHITE,
            border=ft.border.all(1, ft.colors.OUTLINE_VARIANT),
            border_radius=6,
            padding=2,                        
            **kwargs
        )

    def add(self, text, color=ft.colors.BLACK, size=12):
        """내부 리스트뷰에 텍스트 위젯 추가 (업데이트 생략)"""
        self.list_view.controls.append(
            ft.Text(
                value=str(text),
                color=color,
                size=size,
                no_wrap=False,
                selectable=True
            )
        )

    def replace_last(self, text, color=ft.colors.BLACK, size=12):
        """마지막 줄의 내용만 변경 (업데이트 생략)"""
        if self.list_view.controls:
            last_control = self.list_view.controls[-1]
            last_control.value = str(text)
            last_control.color = color
            last_control.size = size
        else:
            self.add(text, color, size)

    def set_list(self, items, color=ft.colors.BLACK, size=12):
        """기존 내용을 모두 지우고 새로운 리스트로 교체 (업데이트 생략)"""
        self.list_view.controls.clear()
        if items:
            for text in items:
                self.list_view.controls.append(
                    ft.Text(
                        value=str(text),
                        color=color,
                        size=size,
                        no_wrap=False,
                        selectable=True
                    )
                )

    def clear(self):
        """내부 리스트뷰 비우기 (업데이트 생략)"""
        self.list_view.controls.clear()

    def perform_update(self):
        """외부(Executor 등)에서 명시적으로 화면을 갱신할 때 호출"""
        self.list_view.update()