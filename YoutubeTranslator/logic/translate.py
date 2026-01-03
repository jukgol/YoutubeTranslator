import os
import time
import threading
import shutil
import re
import requests  # API 쿼터 확인을 위해 추가
import google.generativeai as genai

def get_quota_info(api_key, model_name):    
    return "알 수 없음", "알 수 없음" #구글에 요청하는 방법이 없다

def translate_subtitle_logic(file_path, api_key, rule, model_name, log_callback, update_timer_callback):
    """Gemini AI 번역: 100줄마다 규칙을 주입하여 정확도를 유지하는 로직 (쿼터 로그 추가)"""
    stop_timer = False 
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)

        with open(file_path, 'r', encoding='utf-8') as f:
            source_text = f.read()

        # 1. 파일명 및 폴더 정보 추출
        filename = os.path.basename(file_path)
        original_title = filename.split('_Part')[0]

        # 타이머 시작
        start_time = time.time()
        def run_timer():
            while not stop_timer:
                elapsed = int(time.time() - start_time)
                update_timer_callback(f"⏳ Gemini 번역 대기 중... ({elapsed}초 경과)")
                time.sleep(1)

        timer_thread = threading.Thread(target=run_timer, daemon=True)
        timer_thread.start()

        # --- [데이터 전처리 및 규칙 삽입 로직] ---
        new_source = ""
        lines = source_text.strip().split('\n')
        id_counter = 0  # ID 블록의 개수를 세어 20개마다 규칙 삽입
        
        # 중간에 삽입할 리마인더 태그 정의
        reminder_tag_start = "### [SYSTEM CHECK: RULE REMINDER] ###"
        reminder_tag_end = "### [END OF RULE REMINDER] ###"
        reminder_msg = f"\n\n{reminder_tag_start}\n[중요 지시사항 다시 확인]\n{rule}\n(위 지시사항은 번역하지 말고, 아래 데이터부터 번역을 이어가세요)\n{reminder_tag_end}\n\n"

        for line in lines:
            clean_line = line.strip()
            if not clean_line: continue

            if clean_line.isdigit():
                # 20번째 ID 블록마다 규칙 다시 던져주기
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

        # 3. API 호출
        log_callback(f"🚀 번역 시작 ({id_counter}개 블록): {filename}")
        response = model.generate_content(prompt)
        translated_raw = response.text
  
        # 4. 후처리: 리마인더 태그 강제 제거
        clean_pattern = rf"{re.escape(reminder_tag_start)}.*?{re.escape(reminder_tag_end)}"
        translated_text = re.sub(clean_pattern, "", translated_raw, flags=re.DOTALL).strip()

        # 타이머 정지
        stop_timer = True

        # 5. 폴더 구조 생성 및 저장
        result_dir = os.path.join(os.getcwd(), "translate", original_title)

        # --- [추가된 부분] 저장 폴더 비우기 ---
        if not os.path.exists(result_dir):
            os.makedirs(result_dir)
            log_callback(f"🧹 저장 폴더 생성: {result_dir}")
               
        
        output_name = filename.replace(".txt", "_KR.txt")
        output_path = os.path.join(result_dir, output_name)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(translated_text)

        # 기존 로그 출력 유지
        log_callback(f"\n✅ 완료: {output_name}\n({int(time.time() - start_time)}초 소요)\n")        
        return True

    except Exception as e:
        stop_timer = True
        log_callback(f"❌ 오류 발생: {str(e)}")
        return False

def translate_test_logic(file_path, log_callback, timer_callback):
    """기존 테스트 로직 유지"""
    try:
        filename = os.path.basename(file_path)
        original_title = filename.split('_Part')[0]
        target_dir = os.path.join(os.getcwd(), "translate", original_title)
        os.makedirs(target_dir, exist_ok=True)
        shutil.copy2(file_path, os.path.join(target_dir, filename))
        
        log_callback(f"🧪 테스트 모드 실행 중... ({filename})")
        for i in range(3, 0, -1):
            timer_callback(f"{i}초 대기 중...")
            time.sleep(1)
        log_callback("✅ 테스트 종료")
        return True
    except Exception as e:
        log_callback(f"❌ 테스트 오류: {str(e)}")
        return False