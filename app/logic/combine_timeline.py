import os
import re
import asyncio
import app.log as app_log

# [추가] 인덱스(숫자) 누락 확인 함수
def check_missing_indices(file_path, label):
    indices = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                clean_line = line.strip()
                if clean_line.isdigit():
                    indices.append(int(clean_line))
        
        if not indices:
            return True # 숫자가 하나도 없으면 체크 건너뜀
            
        max_idx = max(indices)
        expected_set = set(range(1, max_idx + 1))
        actual_set = set(indices)
        missing = sorted(list(expected_set - actual_set))
        
        if missing:
            app_log.write(f"❌ {label} 내에 빠진 번호가 있습니다: {missing}")
            return False
        return True
    except:
        return False

async def combine_timeline_logic(combined_text_path, origin_srt_path, result_dir):
    try:
        # --- [추가 부분: 작업 시작 전 인덱스 전수 검사] ---
        # 원본과 번역본 둘 다 숫자가 순서대로 있는지 확인합니다.

        app_log.write(combined_text_path +"\n");
        app_log.write(origin_srt_path +"\n");

        check_a = check_missing_indices(origin_srt_path, "원문(A)")
        check_b = check_missing_indices(combined_text_path, "번역문(B)")
        
        if not (check_a and check_b):
            app_log.write("⚠️ 인덱스 번호가 일치하지 않아 작업을 중단합니다. 파일을 수정해 주세요.")
            return False
        # ----------------------------------------------

        # 1. 원본 SRT에서 타임라인 정보만 추출 (리스트 A)
        with open(origin_srt_path, 'r', encoding='utf-8') as f:
            origin_content = f.read()
        
        timestamp_pattern = re.compile(r"(\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3})")
        timestamps = timestamp_pattern.findall(origin_content)

        # 2. 번역문 로드 및 전처리 (리스트 B)
        with open(combined_text_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            raw_sections = re.split(r'\n\s*\n+', content)
            
        validate_translated_indices(raw_sections)

        translated_lines = []
        for section in raw_sections:
            clean_text = section.strip()
            if not clean_text:
                continue
            
            lines = clean_text.split('\n')
            if lines[0].strip().isdigit():
                clean_text = "\n".join(lines[1:]).strip()
            
            translated_lines.append(clean_text)

        await asyncio.sleep(0.1) 

        # ------------------------------
        # 3. 상세 비교 로그 출력
        app_log.write(f"📊 [비교 시작] 타임라인(A) 개수: {len(timestamps)}개 / 번역문(B) 개수: {len(translated_lines)}개")

        if len(timestamps) != len(translated_lines):
            app_log.write("❌ [불일치 상세 정보]")
            return False
        # 4. SRT 조립
        final_srt = []
        for i, (ts, text) in enumerate(zip(timestamps, translated_lines), 1):
            final_srt.append(str(i))
            final_srt.append(ts)
            final_srt.append(text)
            final_srt.append("")

        # 5. 저장
        file_name = os.path.basename(origin_srt_path)
        output_path = os.path.join(result_dir, file_name)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(final_srt))

        app_log.write(f"✅ 최종 자막 생성 완료: {output_path}")
        return True

    except Exception as e:
        app_log.write(f"❌ 결합 에러: {str(e)}")
        return False


def validate_translated_indices(raw_sections):
    """
    raw_sections의 각 문단 첫 줄이 1부터 시작하는 연속된 숫자인지 확인합니다.
    """
    expected_idx = 1  # 1번부터 시작한다고 하셨으므로 1로 설정
    success = True

    app_log.write(f"🔎 번역본 인덱스 순서 검사 시작 (총 {len(raw_sections)}개 문단)")

    for i, section in enumerate(raw_sections):
        # 1. 문단을 줄 단위로 나누고 빈 줄 제외
        lines = [line.strip() for line in section.split('\n') if line.strip()]
        
        if not lines:
            continue  # 완전히 빈 문단은 건너뜀

        # 2. 첫 번째 줄이 숫자인지 확인
        first_line = lines[0]
        if first_line.isdigit():
            current_idx = int(first_line)
            
            # 3. 예상되는 번호와 실제 번호 비교
            if current_idx != expected_idx:
                app_log.write(f"❌ 순서 오류: {i}번째 문단에서 번호 {expected_idx}를 예상했으나 {current_idx}가 발견되었습니다.")
                success = False
                # 다음 검사를 위해 인덱스를 실제 발견된 번호 기준으로 강제 동기화 (옵션)
                expected_idx = current_idx
        else:
            app_log.write(f"⚠️ 경고: {i}번째 문단이 숫자로 시작하지 않습니다. 내용 일부: '{first_line[:15]}...'")
            success = False
        
        expected_idx += 1

    if success:
        app_log.write("✅ 모든 번역본 인덱스가 순서대로 잘 배치되어 있습니다.")
    else:
        app_log.write("⚠️ 인덱스 불일치가 발견되었습니다. 파일을 확인해 주세요.")
        
    return success