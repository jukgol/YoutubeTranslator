import flet as ft

class LabeledInput(ft.Row):
    """라벨과 입력창(TextField)이 결합된 기본 단위"""
    def __init__(self, label_text, is_multiline=False, save_cmd=None):
        super().__init__()
        self.vertical_alignment = ft.CrossAxisAlignment.CENTER # 수직 중앙 정렬
        
        # 1. 위젯 생성
        if is_multiline:
            # Tkinter의 Text(height=4) 대응
            self.widget = ft.TextField(multiline=True, min_lines=4, expand=True)
        else:
            # Tkinter의 Entry 대응
            self.widget = ft.TextField(expand=True, height=40) # 높이를 적절히 조절
            
        # 2. 이벤트 바인딩 (FocusOut -> on_blur)
        if save_cmd:
            self.widget.on_blur = lambda e: save_cmd()

        # 3. 레이아웃 구성
        self.controls = [
            ft.Text(label_text, width=120), # width 15 대응 (픽셀 단위 조정)
            self.widget
        ]