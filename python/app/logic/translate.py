import os
import time
import threading
import shutil
import re
import requests  # API 쿼터 확인을 위해 추가
import asyncio
import google.generativeai as genai
from app.path import paths
import app.log as app_log

def get_quota_info(api_key, model_name):    
    return "알 수 없음", "알 수 없음" #구글에 요청하는 방법이 없다

async def translate_subtitle_logic(file_path, api_key, rule, model_name):
    """
    비동기 번역 프로세스를 총괄하는 메인 함수
    """
    # 1. 종료 신호를 위한 이벤트 객체 생성
    stop_event = asyncio.Event()
    
    # 2. 타이머를 백그라운드 태스크로 예약 (즉시 실행 시작)
    timer_task = asyncio.create_task(
        _run_timer_task(stop_event)
    )
    
    success = False
    try:
        # 3. 실제 번역 로직 실행 및 결과 대기
        # 이 줄에서 번역이 끝날 때까지 머무르지만, UI는 타이머 덕분에 멈추지 않음
        success = await _translate_subtitle_core(
            file_path, api_key, rule, model_name
        )
    finally:
        # 4. 번역이 성공하든 실패(에러)하든 타이머는 반드시 멈춰야 함
        stop_event.set()
        
        # 5. 타이머 태스크가 안전하게 종료(Cleanup)될 때까지 대기
        await timer_task
    
    # 6. 최종 결과를 호출자에게 반환
    return success

def translate_test_logic(file_path):
    """기존 테스트 로직 유지"""
    try:
        filename = os.path.basename(file_path)
        original_title = filename.split('_Part')[0]
        # Use Path objects from `paths` to build consistent project paths
        target_dir = paths.translate_dir / original_title
        target_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file_path, str(target_dir / filename))
        
        app_log.write(f"🧪 테스트 모드 실행 중... ({filename})")
        for i in range(3, 0, -1):
            app_log.update_timer(f"{i}초 대기 중...")
            time.sleep(1)
        app_log.write("✅ 테스트 종료")
        return True
    except Exception as e:
        app_log.write(f"❌ 테스트 오류: {str(e)}")
        return False


async def _translate_subtitle_core(file_path, api_key, rule, model_name):
    """기존 번역 및 파일 저장 로직 유지 (비동기 버전)"""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)

        with open(file_path, 'r', encoding='utf-8') as f:
            source_text = f.read()

        # 1. 파일명 및 폴더 정보 추출
        filename = os.path.basename(file_path)
        original_title = filename.split('_Part')[0]
        start_time = time.time() # 완료 로그용 시간 측정

        # --- [데이터 전처리 및 규칙 삽입 로직] ---
        new_source = ""
        lines = source_text.strip().split('\n')
        id_counter = 0 
        
        reminder_tag_start = "### [SYSTEM CHECK: RULE REMINDER] ###"
        reminder_tag_end = "### [END OF RULE REMINDER] ###"
        reminder_msg = f"\n\n{reminder_tag_start}\n[중요 지시사항 다시 확인]\n{rule}\n(위 지시사항은 번역하지 말고, 아래 데이터부터 번역을 이어가세요)\n{reminder_tag_end}\n\n"

        for line in lines:
            clean_line = line.strip()
            if not clean_line: continue
            if clean_line.isdigit():
                if id_counter > 0 and id_counter % 20 == 0:
                    new_source += reminder_msg
                new_source += f"\n\n[ID:{clean_line}]\n"
                id_counter += 1
            else:
                new_source += f"{clean_line}\n"
        
        # 2. 메인 프롬프트 구성
        final_rule = (
            f"{rule}\n\n"
            f"주의: 본문 중간에 '{reminder_tag_start}'로 시작하는 문구가 나타나면 "
            f"이는 당신의 규칙을 상기시키기 위한 것이므로 절대 번역하거나 출력 결과에 포함하지 마세요."
        )
        prompt = f"{final_rule}\n\n---\n번역할 자막 데이터:\n{new_source}"

        # 3. API 호출 (비동기 await 적용)
        app_log.write(f"🚀 번역 시작 ({id_counter}개 블록): {filename}")
        response = await model.generate_content_async(prompt) # await 적용
        translated_raw = response.text
  
        # 4. 후처리: 리마인더 태그 강제 제거
        clean_pattern = rf"{re.escape(reminder_tag_start)}.*?{re.escape(reminder_tag_end)}"
        translated_text = re.sub(clean_pattern, "", translated_raw, flags=re.DOTALL).strip()

        # 5. 폴더 구조 생성 및 저장
        result_dir = paths.translate_dir / original_title
        if not result_dir.exists():
            result_dir.mkdir(parents=True, exist_ok=True)
            app_log.write(f"🧹 저장 폴더 생성: {result_dir}")
        
        output_name = filename.replace(".txt", "_KR.txt")
        output_path = result_dir / output_name

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(translated_text)

        app_log.write(f"\n✅ 완료: {output_name}\n({int(time.time() - start_time)}초 소요)\n")        
        return True

    except Exception as e:
        app_log.write(f"❌ 오류 발생: {str(e)}")
        return False

async def _run_timer_task(stop_event):
    """기존 타이머 로직 유지: 1초마다 경과 시간 UI 업데이트"""
    start_time = time.time()
    while not stop_event.is_set():
        elapsed = int(time.time() - start_time)
        app_log.update_timer(f"⏳ Gemini 번역 대기 중... ({elapsed}초 경과)")
        await asyncio.sleep(1) # 제어권을 양보하며 1초 대기