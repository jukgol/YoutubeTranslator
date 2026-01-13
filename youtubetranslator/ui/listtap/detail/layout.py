import flet as ft
from youtubetranslator.ui import factory as f 

def setup_detail_layout(self):
    """DetailTab의 외형을 구성하고, 모든 주요 위젯을 self에 직접 바인딩합니다."""
    layout_row = ft.Row(
        expand=True, 
        spacing=8, 
        vertical_alignment=ft.CrossAxisAlignment.STRETCH
    )

    # 각 섹션을 생성하고, 리스트와 버튼을 각각 self 변수에 할당합니다.
    # 이렇게 하면 setup_handler에서 접근하기가 매우 쉬워집니다.
    self.origin_frame, self.origin_list, self.btn_split = _add_detail_section(" 1. 원본 ", "▼ 분리 실행", ft.colors.GREEN_700)
    self.split_frame, self.split_list, self.btn_translate = _add_detail_section(" 2. 스플릿 ", "▶ 번역 시작", ft.colors.BLUE_700)
    self.translated_frame, self.translated_list, self.btn_combine_parts = _add_detail_section(" 3. 번역 ", "▼ 파트 합치기", ft.colors.ORANGE_700)
    self.combine_frame, self.combine_list, self.btn_timeline = _add_detail_section(" 4. 합치기 ", "⌛ 타임라인 생성", ft.colors.LIGHT_GREEN_700)
    self.result_frame, self.result_list, self.btn_final = _add_detail_section(" 5. 결과 ", "최종 확인", ft.colors.PURPLE_700)

    layout_row.controls.extend([
        self.origin_frame, self.split_frame, self.translated_frame, 
        self.combine_frame, self.result_frame
    ])

    self.controls = [layout_row]

def _add_detail_section(title, btn_text, color):
    """부품을 생성하여 프레임, 리스트위젯, 버튼을 각각 반환합니다."""
    text_widget = f.create_list_field(True)
    main_btn = f.create_button(text=btn_text, color=color)
    
    # 레이아웃 구성
    section_frame = f.add_section(title, text_widget, [main_btn])
    
    # 배선을 위해 프레임, 리스트, 버튼 세 가지를 모두 반환합니다.
    return section_frame, text_widget, main_btn