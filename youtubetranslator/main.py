import flet as ft
import asyncio
from app import SubtitleSplitterApp # 이전에 보여주신 클래스 파일

# 1. async def로 선언하여 비동기 환경(Event Loop)을 만듭니다.
async def main(page: ft.Page):
    # App 인스턴스 생성 (page를 전달하여 계속 들고 다니게 함)
    app = SubtitleSplitterApp(page)
    
    # 2. [중요] 비동기 화면 갱신
    # 유니티에서 프레임이 넘어가야 화면이 바뀌듯, 
    # 비동기에서는 명시적으로 await를 사용하여 화면을 그려줍니다.
    page.update()

if __name__ == "__main__":
    # Flet이 내부적으로 main이 async인 것을 감지하고 비동기로 실행합니다.
    ft.app(target=main)