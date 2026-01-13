import os
import tkinter as tk

class RefreshHandler:
    def __init__(self, handler):
        # 이제 부모는 'handler(UIHandlers)'입니다.
        self.handler = handler 

    def refresh_widget(self, widget, directory, extensions=('.srt', '.txt'), show_dirs=False):
        """Text 위젯에 목록을 삽입합니다."""
        widget.config(state=tk.NORMAL)
        widget.delete("1.0", tk.END)
        
        widget.tag_configure("highlight", background="#e0e0ff")
        
        if os.path.exists(directory):
            if show_dirs:
                # 하위 폴더 목록
                items = sorted([d for d in os.listdir(directory) 
                                if os.path.isdir(os.path.join(directory, d))])
            else:
                # 특정 확장자의 파일 목록
                items = sorted([f for f in os.listdir(directory) 
                                if f.lower().endswith(extensions)])

            for item in items:
                prefix = "📁 " if show_dirs else ""
                widget.insert(tk.END, prefix + item + "\n")
                widget.insert(tk.END, "-" * 15 + "\n")
        
        widget.bind("<Button-1>", lambda e: self.on_click(widget))
        widget.config(state=tk.DISABLED)

    def on_click(self, widget):
        """클릭 시 해당 줄 강조"""
        widget.tag_remove("highlight", "1.0", tk.END)
        
        def highlight_step():
            try:
                start = widget.index("insert linestart")
                end = widget.index("insert lineend")
                line_text = widget.get(start, end).strip()
                if line_text and not line_text.startswith("-"):
                    widget.tag_add("highlight", start, end + " + 1c")
            except Exception:
                pass
        
        widget.after(10, highlight_step)

    def refresh_translated_with_parts(self, widget, directory):
        """번역 목록 전용 트리 구조 표시"""
        widget.config(state=tk.NORMAL)
        widget.delete("1.0", tk.END)
        widget.tag_configure("highlight", background="#e0e0ff")
        widget.tag_configure("part_item", foreground="#555555")

        if os.path.exists(directory):
            folders = sorted([d for d in os.listdir(directory) 
                             if os.path.isdir(os.path.join(directory, d))])

            for folder in folders:
                widget.insert(tk.END, f"📁 {folder}\n")
                
                folder_path = os.path.join(directory, folder)
                files = sorted([f for f in os.listdir(folder_path) if f.lower().endswith('.txt')])
                
                for f in files:
                    if "_Part" in f:
                        display_part = f[f.find("Part"):] 
                        display_name = f"   └─ {display_part}"
                    else:
                        display_name = f"   └─ {f}"
                    
                    widget.insert(tk.END, display_name + "\n", "part_item")
                
                widget.insert(tk.END, "-" * 20 + "\n")

        widget.bind("<Button-1>", lambda e: self.highlight_folder_group(widget))
        widget.config(state=tk.DISABLED)

    def refresh_result_list(self, widget, directory):
        """최종 결과 목록 표시"""
        widget.config(state=tk.NORMAL)
        widget.delete("1.0", tk.END)
        widget.tag_configure("highlight", background="#f3e5f5")

        if os.path.exists(directory):
            files = sorted([f for f in os.listdir(directory) if f.lower().endswith(('.srt', '.txt'))])
            for f in files:
                widget.insert(tk.END, f + "\n")
                widget.insert(tk.END, "-" * 15 + "\n")
        
        widget.config(state=tk.DISABLED)   

    def highlight_folder_group(self, widget):
        """폴더 그룹 전체 하이라이트"""
        widget.tag_remove("highlight", "1.0", tk.END)
        
        def task():
            try:
                curr_idx = widget.index("insert linestart")
                curr_line_num = int(curr_idx.split('.')[0])
                
                start_line = curr_line_num
                while start_line > 0:
                    line_text = widget.get(f"{start_line}.0", f"{start_line}.end")
                    if "📁" in line_text:
                        break
                    start_line -= 1
                
                if start_line == 0: return

                end_line = start_line + 1
                while True:
                    line_text = widget.get(f"{end_line}.0", f"{end_line}.end")
                    if "-" * 10 in line_text or not line_text.strip():
                        break
                    end_line += 1
                
                widget.tag_add("highlight", f"{start_line}.0", f"{end_line}.0")
            except:
                pass
        
        widget.after(10, task)

    def sync_simple_tab(self):
        """'한번에' 탭(SimpleTab)의 원본 및 결과 리스트를 새로고침합니다."""
        # 1. 원본 목록 동기화 (SimpleTab의 왼쪽 영역)
        if hasattr(self.handler, 'simple_origin_list'):
            self.refresh_widget(
                self.handler.simple_origin_list, 
                self.handler.path.origin_dir
            )
        
        # 2. 결과 목록 동기화 (SimpleTab의 오른쪽 영역)
        if hasattr(self.handler, 'simple_result_list'):
            self.refresh_widget(
                self.handler.simple_result_list, 
                self.handler.path.result_final_dir
            )

    def sync_detail_tab(self):
        """상세 탭(기존 5개 목록)의 리스트들을 새로고침합니다."""
        # 1. 원본 목록
        self.refresh_widget(self.handler.origin_listbox, self.handler.path.origin_dir)        
        # 2. 스플릿 목록 (트리 구조)
        self.refresh_translated_with_parts(self.handler.split_listbox, self.handler.path.split_dir)        
        # 3. 번역 목록 (트리 구조)
        self.refresh_translated_with_parts(self.handler.translated_listbox, self.handler.path.translate_dir)        
        # 4. 합치기 목록
        self.refresh_widget(self.handler.combine_listbox, self.handler.path.combine_dir, ('.txt', '.srt'))        
        # 5. 결과 목록
        self.refresh_result_list(self.handler.result_listbox, self.handler.path.result_final_dir)

    def refresh_all(self):
        """전체 탭(상세 탭 + 한번에 탭)의 모든 목록을 새로고침합니다."""
        # 상세 설정 탭 목록 업데이트
        self.sync_detail_tab()
        
        # '한번에' 탭 목록 업데이트
        self.sync_simple_tab()