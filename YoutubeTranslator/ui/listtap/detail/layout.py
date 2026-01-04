import flet as ft
import ui.factory as f 

def setup_detail_layout(self): # self는 DetailTab 인스턴스를 의미함
    """DetailTab의 레이아웃을 구성하는 독립 함수"""
    layout_row = ft.Row(
        expand=True, 
        spacing=8, 
        vertical_alignment=ft.CrossAxisAlignment.STRETCH
    )

    # 각 섹션 생성 및 참조 저장
    self.origin_frame, self.origin_list = _add_detail_section(" 1. 원본 ", "▼ 분리 실행", ft.Colors.GREEN_700)
    self.split_frame, self.split_list = _add_detail_section(" 2. 스플릿 ", "▶ 번역 시작", ft.Colors.BLUE_700)
    self.translated_frame, self.translated_list = _add_detail_section(" 3. 번역 ", "▼ 파트 합치기", ft.Colors.ORANGE_700)
    self.combine_frame, self.combine_list = _add_detail_section(" 4. 합치기 ", "⌛ 타임라인 생성", ft.Colors.LIGHT_GREEN_700)
    self.result_frame, self.result_list = _add_detail_section(" 5. 결과 ", "최종 확인", ft.Colors.PURPLE_700)

    layout_row.controls.extend([
        self.origin_frame, self.split_frame, self.translated_frame, 
        self.combine_frame, self.result_frame
    ])

    self.controls = [layout_row]

def _add_detail_section(title, btn_text, color):
    """부품을 준비하여 factory.add_section으로 전달"""
    text_widget = f.create_list_field()
    main_btn = f.create_button(text=btn_text, color=color)
    
    text_widget.main_btn = main_btn
    
    # 통합 함수 호출
    section_frame = f.add_section(title, text_widget, [main_btn])
    return section_frame, text_widget