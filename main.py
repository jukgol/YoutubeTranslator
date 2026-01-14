import flet as ft
from app import SubtitleSplitterApp

def main(page: ft.Page):
    app = SubtitleSplitterApp(page)

if __name__ == "__main__":
    ft.app(target=main)