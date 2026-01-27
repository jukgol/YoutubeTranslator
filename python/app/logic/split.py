import re
import os
import asyncio
import app.log as app_log

def get_line_count_split_groups(detected_eps, ep_map, has_start=False):
    all_units = []
    
    textIndex = 250
    # 1. 모든 에피소드를 textIndex줄 단위로 쪼개서 리스트에 순서대로 담기
    # "Start" 부분 처리
    if has_start:
        start_data = ep_map.get("Start", [])
        for i in range(0, len(start_data), textIndex):
            all_units.append(start_data[i : i + textIndex])
    
    # 일반 에피소드 처리
    for ep in detected_eps:
        ep_data = ep_map.get(ep, [])
        # textIndex줄 이하면 1개 단위로, 넘으면 textIndex줄씩 쪼개서 담김
        for i in range(0, len(ep_data), textIndex):
            all_units.append(ep_data[i : i + textIndex])

    # 2. 요청하신 3개 / 3개 / 나머지 규칙 적용
    groups = []
    groups.append(all_units[0:3])   # Part 1 (앞의 3단위)
    
    if len(all_units) > 3:
        groups.append(all_units[3:6]) # Part 2 (그다음 3단위)
        
    if len(all_units) > 6:
        groups.append(all_units[6:])  # Part 3 (남은 전부)

    return groups

async def split_subtitle_logic(file_path, origin_dir):
    """에피소드/라인 수 기준 분할 및 타임라인 제거 저장"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().replace('\ufeff', '')

    content = re.sub(r'=\s*Episode\s+(\d+)\s*=', r'=Episode \1=', content)
    blocks = content.strip().split('\n\n')
    
    ep_map = {}
    current_ep = "Start" 
    
    for block in blocks:
        lines = block.split('\n')
        if len(lines) < 2: continue 

        match = re.search(r'=Episode (\d+)=', block)
        if match:
            current_ep = int(match.group(1))
            
        if current_ep not in ep_map:
            ep_map[current_ep] = []

        index = lines[0]
        text = "\n".join(lines[2:]) if '-->' in lines[1] else "\n".join(lines[1:])
        ep_map[current_ep].append(f"{index}\n{text}")

    detected_eps = sorted([e for e in ep_map.keys() if isinstance(e, int)])
    
    # [수정된 부분] 라인 수 기반 그룹화 함수 호출 (ep_map 전달)
    groups = get_line_count_split_groups(detected_eps, ep_map, has_start=("Start" in ep_map))

    base_name = os.path.splitext(os.path.basename(file_path))[0]
    parent_dir = os.path.dirname(origin_dir)
    split_dir = os.path.join(parent_dir, "split")
    save_dir = os.path.join(split_dir, base_name)

    clear_folder_contents(save_dir)

    # 5. 파일 저장
    for i, group in enumerate(groups):
        if not group: continue
        
        output_data = []
        total_lines = 0
        for unit in group: 
        # unit 자체가 이미 자막 텍스트 리스트이므로 바로 사용합니다.
            output_data.extend(unit)
            total_lines += len(unit)
        
        if not output_data: continue

        # [수정된 부분] 파일명에 에피소드 번호 대신 Line(인덱스 수) 표시
        output_name = f"{base_name}_Part{i+1}_Line_{total_lines}_no_time.txt"
        output_path = os.path.join(save_dir, output_name)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n\n".join(output_data))
            
        app_log.write(f"저장 완료: {output_name} (총 {total_lines} 라인)")


def clear_folder_contents(folder_path):
    if os.path.exists(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
    else:
        os.makedirs(folder_path)