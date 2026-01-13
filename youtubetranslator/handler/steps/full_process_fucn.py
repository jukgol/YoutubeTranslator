from ast import Await
import os
from youtubetranslator.logic import (
    split_subtitle_logic, 
    combine_parts_logic, 
    combine_timeline_logic
)
from youtubetranslator.handler.steps.translate_queue import process_folder_queue  # import directly from handler to avoid circular import 

async def step_1_split(handler, path_service, base_name, filename):
    """[Step 1] 원본 파일을 여러 파트로 분리"""
    handler.ui_update_simple_status(0, "active")
    file_path = path_service.get_origin_path(filename)
    
    await split_subtitle_logic(file_path, handler.path.origin_dir, handler.log)
    
    split_folder = path_service.get_split_folder_path(base_name)
    if not os.path.exists(split_folder):
        handler.log(f"❌ 1단계 실패: 분리 폴더가 생성되지 않았습니다. ({split_folder})")
        handler.ui_update_simple_status(0, "error")
        return False
        
    handler.ui_update_simple_status(0, "done")
    handler.log("✅ 1단계(분리) 완료")
    return True

async def step_2_translate(handler, split_folder, api_key, rule, model_name):
    """[Step 2] 분리된 파트들을 AI를 통해 번역"""
    handler.ui_update_simple_status(1, "active")
    
    result = await process_folder_queue(
        split_folder, api_key, rule, model_name, 
        handler.log, handler.update_timer_log
    )
    
    if result is not True:
        handler.log("❌ 2단계 실패: 번역 중 오류 발생")
        handler.ui_update_simple_status(1, "error")
        return False
    
    handler.ui_update_simple_status(1, "done")
    handler.log("✅ 2단계(번역) 완료")
    return True

async def step_3_combine_parts(handler, base_name):
    """[Step 3] 번역된 파트 합치기"""
    handler.ui_update_simple_status(2, "active")
    
    result = await combine_parts_logic(
        base_name, handler.path.translate_dir, 
        handler.path.combine_dir, handler.log
    )
    
    if result is not True:
        handler.log("❌ 3단계 합치기 실패")
        handler.ui_update_simple_status(2, "error")
        return False
    
    handler.ui_update_simple_status(2, "done")
    handler.log("✅ 3단계(합치기) 완료")
    return True

async def step_4_combine_timeline(handler, path_service, base_name, filename):
    """[Step 4] 최종 타임라인 결합"""
    handler.ui_update_simple_status(3, "active")
    
    combined_path = path_service.get_combine_file_path(base_name)
    combined_path = combined_path + ".txt"
    origin_srt_path = path_service.get_origin_srt_for_combine(filename)

    result = await combine_timeline_logic(
        combined_path, origin_srt_path, 
        handler.path.result_final_dir, handler.log
    )
    
    if result is not True:
        handler.log("❌ 4단계 최종 결합 실패")
        handler.ui_update_simple_status(3, "error")
        return False
    
    handler.ui_update_simple_status(3, "done")
    handler.log("✅ 4단계(최종 결합) 완료")
    return True