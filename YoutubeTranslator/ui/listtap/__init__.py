import tkinter as tk
from tkinter import ttk
from .detail import DetailTab
from .simple import SimpleTab
from .download import DownloadTab  # 1. 신규 탭 임포트

class ListTabContainer(tk.Frame):
    def __init__(self, parent, handler):
        super().__init__(parent)
        self.handler = handler
        self.notebook = ttk.Notebook(self)

        self.notebook.pack(fill=tk.BOTH, expand=True)

        # 탭 생성
        self.detail_tab = DetailTab(
            self.notebook, 
            handler
        )
        self.simple_tab = SimpleTab(self.notebook, self.handler)
        self.download_tab = DownloadTab(self.notebook, self.handler)

        # 탭 추가 (순서: 영상 다운로드 -> 한번에 -> 세분화)
        self.notebook.add(self.download_tab, text=" 영상 다운로드 ")
        self.notebook.add(self.simple_tab, text=" 한번에 ")
        self.notebook.add(self.detail_tab, text=" 세분화 ")