import os
import re
import app.log as app_log

async def combine_parts_logic(folder_name, translate_dir, combine_dir):
    try:
        source_folder = os.path.join(translate_dir, folder_name)
        if not os.path.exists(source_folder):
            app_log.write(f"❌ 폴더를 찾을 수 없습니다: {source_folder}")
            return False
        
        files = sorted([f for f in os.listdir(source_folder) if f.lower().endswith('.txt')])
        if not files:
            app_log.write(f"⚠️ {folder_name} 폴더에 합칠 파일이 없습니다.")
            return False

        app_log.write(f"🚀 {folder_name} 파트 합치기 시작 (총 {len(files)}개 파트)")

        combined_content = []
        for i, filename in enumerate(files):
            file_path = os.path.join(source_folder, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                content = re.sub(r'\[ID:(\d+)\]\s*', r'\n\1\n', content).strip()
                combined_content.append(content)
                
                if i < len(files) - 1:
                    combined_content.append("\n\n") 

        output_path = os.path.join(combine_dir, f"{folder_name}.txt")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.writelines(combined_content)

        app_log.write(f"✅ 합치기 완료: {output_path}")
        return True

    except Exception as e:
        app_log.write(f"❌ 작업 중 에러 발생: {str(e)}")
        return False