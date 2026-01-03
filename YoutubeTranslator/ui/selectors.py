# ui/selectors.py
import tkinter as tk

def get_selected_line(widget):
    """위젯에서 현재 선택된(커서가 있는) 줄의 텍스트를 가져옵니다."""
    try:
        # Tkinter Text 위젯의 현재 행 텍스트 추출
        line = widget.get("insert linestart", "insert lineend").strip()
        if not line or line.startswith("-"): 
            return None
        return line
    except Exception:
        return None

def get_pure_filename(widget):
    """일반 파일 목록에서 기호가 없는 순수 파일명만 추출합니다."""
    line = get_selected_line(widget)
    # 파일명에는 📁나 └─가 포함되어서는 안 됨
    if not line or "📁" in line or "└─" in line:
        return None
    return line

def get_folder_context(widget):
    """클릭한 위치를 기준으로 위로 올라가며 가장 가까운 폴더명(📁)을 찾습니다."""
    try:
        curr_idx = widget.index("insert linestart")
        curr_line_num = int(curr_idx.split('.')[0])
        
        # 위로 검색하며 📁 아이콘이 포함된 줄을 찾음
        for line_num in range(curr_line_num, 0, -1):
            line_text = widget.get(f"{line_num}.0", f"{line_num}.end").strip()
            if "📁" in line_text:
                return line_text.replace("📁", "").strip()
            if "-" * 10 in line_text: # 구분선을 만나면 중단
                break
        return None
    except:
        return None

def get_translated_item_info(widget):
    """트리 구조(3번 목록)에서 선택된 폴더명과 파트 파일명을 동시에 추출합니다."""
    try:
        current_text = get_selected_line(widget)
        if not current_text or "└─" not in current_text:
            return None
        
        # 파트 이름 추출
        part_name_short = current_text.replace("└─", "").strip()
        # 해당 파트가 속한 상위 폴더 이름 추출
        folder_name = get_folder_context(widget)
        
        if folder_name and part_name_short:
            return folder_name, part_name_short
        return None
    except:
        return None