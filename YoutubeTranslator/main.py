import flet as ft
from app import SubtitleSplitterApp

def main(page: ft.Page):
    # Tkinter의 root 역할을 Flet에서는 page가 수행합니다.
    app = SubtitleSplitterApp(page)

if __name__ == "__main__":
    # Tkinter의 root.mainloop()와 유사하게 앱을 실행하고 이벤트를 대기합니다.
    ft.app(target=main)