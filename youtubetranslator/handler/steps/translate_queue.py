import os
import time
import asyncio
from logic.translate import translate_subtitle_logic
from youtubetranslator.path import paths

# --- [추가] 폴더 내 모든 파일을 삭제하는 함수 ---
def clear_folder_contents(folder_path):
    if os.path.exists(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
    else:
        os.makedirs(folder_path)

async def process_folder_queue(folder_path, api_key, rule, model_name, log_callback, update_timer_callback):
    """
    폴더 내의 txt 파일들을 하나씩 번역하고, 
    각 파일 완료 시마다 60초 대기 시간을 갖는 큐 관리 함수
    """
    try:
        # 1. 폴더 확인 및 txt 파일 목록 추출
        if not os.path.exists(folder_path):
            log_callback(f"❌ 폴더 경로를 찾을 수 없습니다: {folder_path}")
            return

        # .txt 확장자만 골라서 정렬 (Part1, Part2... 순서 보장)
        files = [f for f in os.listdir(folder_path) if f.lower().endswith('.txt')]
        files.sort()

        if not files:
            log_callback("ℹ️ 처리할 .txt 파일이 없습니다.")
            return

        total_files = len(files)
        log_callback(f"📂 총 {total_files}개의 파일을 순차적으로 처리합니다.")

        # --- [추가된 한 줄] 번역 결과가 저장될 폴더를 미리 비움 ---
        # 첫 번째 파일 이름을 기준으로 결과 폴더 경로를 계산하여 비웁니다.
        result_dir = paths.translate_dir / files[0].split('_Part')[0]
        clear_folder_contents(str(result_dir)) 

        # 2. 파일별 순차 실행 루프
        for index, filename in enumerate(files):
            file_path = os.path.join(folder_path, filename)
            
            # 현재 처리 정보 로그 출력
            log_callback(f"📄 [{index + 1}/{total_files}] 번역 시작: {filename}")
            
            # [기존 함수 실행] 
            success = await translate_subtitle_logic(
                file_path, 
                api_key, 
                rule, 
                model_name, 
                log_callback, 
                update_timer_callback
            )

            # 3. 마지막 파일이 아닐 경우에만 60초 대기
            if index < total_files - 1:
                if success:
                    log_callback(f"✅ {filename} 완료. 다음 작업을 위해 60초간 대기합니다.")
                else:
                    log_callback(f"⚠️ {filename} 처리 중 오류가 있었으나, 안전을 위해 60초 대기 후 다음으로 넘어갑니다.")

                # 60초 카운트다운 루프
                for i in range(60, 0, -1):
                    update_timer_callback(f"⏳ 다음 파일 대기 중... ({i}초 남음)")
                    await asyncio.sleep(1)
                
                update_timer_callback("✅ 대기 종료. 다음 파일로 이동합니다.")
            else:
                # 마지막 파일인 경우
                log_callback(f"✅ 마지막 파일({filename}) 처리가 완료되었습니다.")

        log_callback(f"🎉 모든 파일({total_files}개)에 대한 프로세스가 완료되었습니다.")
        return True

    except Exception as e:
        log_callback(f"❌ 큐 실행 중 오류 발생: {str(e)}")
        return False