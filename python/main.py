import flet as ft
from app import SubtitleSplitterApp
import app.log as log

def main(page: ft.Page):
    app = SubtitleSplitterApp(page)
    log.write("Test log from main.py startup!")

if __name__ == "__main__":
    ft.app(target=main)