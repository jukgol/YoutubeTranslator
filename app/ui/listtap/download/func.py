def _update_list_panel(panel, data):
    """SmartListPanel에 데이터를 안전하게 채우는 헬퍼 함수"""
    if isinstance(data, list):
        panel.set_list(data)
    else:
        panel.set_list([str(data)])
