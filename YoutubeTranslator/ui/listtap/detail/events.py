import flet as ft

def connect_detail_events(self, handler):
    """
    각 단계별 버튼과 핸들러의 상세 로직(h.detail)을 1:1로 연결합니다.
    레이아웃에서 직접 바인딩한 변수들을 사용하여 경로가 매우 단순해졌습니다.
    """
    h = handler
    
    # 1. 원본 분리 (h.detail 전담 객체 활용)
    self.btn_split.on_click = lambda _: h.detail.handle_split()
    
    # 2. 번역 시작
    self.btn_translate.on_click = lambda _: h.detail.handle_translate()
    
    # 3. 파트 합치기
    self.btn_combine_parts.on_click = lambda _: h.detail.handle_combine_parts()
    
    # 4. 타임라인 생성
    self.btn_timeline.on_click = lambda _: h.detail.handle_combine_timeline()
    
    # 5. 결과 확인 및 마무리
    self.btn_final.on_click = lambda _: h.detail.handle_final_check()

    self.on_active = lambda _: h.detail.refresh_all()
    print("⚡ DetailTab: 5단계 공정 이벤트 배선 완료")