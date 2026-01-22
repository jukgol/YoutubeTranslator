import yt_dlp
import os
import re
import asyncio
import app.log as app_log

# =========================================================
# [1] 도구 함수
# =========================================================

ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def remove_ansi(text):
    return ansi_escape.sub('', text)

# PathManager가 폴더 생성을 관리하므로 기존 check_folders는 제거하거나 
# PathManager 내부 로직으로 대체되었습니다.

# DB 저장 함수 더미
def add_record(title, url):
    pass

# =========================================================
# [2] 진행 상황 감시자 (Hook) - 로직 유지
# =========================================================

def progress_hook_wrapper(d):
    # if not log_callback: # No longer needed
    #     return

    if not hasattr(progress_hook_wrapper, 'last_file'):
        progress_hook_wrapper.last_file = None

    if d['status'] == 'downloading':
        full_path = d.get('filename', '알수없음')
        current_filename = os.path.basename(full_path)
        
        if progress_hook_wrapper.last_file != current_filename:
            progress_hook_wrapper.last_file = current_filename
            app_log.write(f"📄 [파일] {current_filename}", replace=False)
            app_log.write("    ⬇ [대기] 다운로드 시작...", replace=False)

        p = remove_ansi(d.get('_percent_str', '0%')).replace('%', '')
        speed = remove_ansi(d.get('_speed_str', 'N/A'))
        eta = remove_ansi(d.get('_eta_str', 'N/A'))
        
        msg = f"    ⬇ [진행] {p}% | 🚀 {speed} | ⏳ {eta}"
        try:
            app_log.write(msg, replace=True)
        except:
            pass

    elif d['status'] == 'finished':
        try:
            size_str = d.get('_total_bytes_str', '')
            if not size_str:
                total_bytes = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
                if total_bytes:
                    size_str = f"{total_bytes / 1024 / 1024:.2f}MiB"
                else:
                    size_str = "N/A"
            size_str = remove_ansi(size_str)

            time_str = d.get('_elapsed_str', '')
            if not time_str:
                elapsed = d.get('elapsed', 0)
                m, s = divmod(int(elapsed), 60)
                time_str = f"{m:02d}:{s:02d}"
            time_str = remove_ansi(time_str)

            final_msg = f"    ✅ [완료] 소요시간: {time_str} | 용량: {size_str}"
            app_log.write(final_msg, replace=True)
        except Exception as e:
            pass

def post_hook_wrapper(d):
    # if not log_callback: # No longer needed
    #     return
    
    if d['status'] == 'started':
        pp_name = d.get('postprocessor', '')
        if 'Merger' in pp_name:
            app_log.write("    🔨 [병합] 영상과 오디오를 하나로 합치는 중...", replace=True)
        elif 'Subtitle' in pp_name:
            app_log.write("    📝 [자막] 자막 데이터를 정리하는 중...", replace=True)
    
    elif d['status'] == 'finished':
        pass

# =========================================================
# [3] 설정 관리 함수 (PathManager 적용)
# =========================================================

def get_ydl_opts(path_manager, mode="full"):
    """
    path_manager를 전달받아 경로를 동적으로 설정합니다.
    """
    opts = {
        'cookiefile': path_manager.cookie_file, # PathManager의 쿠키 경로 사용
        'no_color': True,
        'noprogress': True,
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        
        'sleep_subtitles': 1,
        'subtitleslangs': ['zh-Hans', 'en', 'ko', 'id', 'zh'], 
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitlesformat': 'srt', 
        
        'progress_hooks': [lambda d: progress_hook_wrapper(d)],
        'postprocessor_hooks': [lambda d: post_hook_wrapper(d)],
    }

    if mode == "full":
        opts.update({
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'merge_output_format': 'mp4',
            'outtmpl': {
                # data -> video_dir / data/download_sub -> origin_dir
                'default': os.path.join(path_manager.video_dir, '%(title)s.%(ext)s'),
                'subtitle': os.path.join(path_manager.origin_dir, '%(title)s.%(ext)s')
            },
        })
    elif mode == "subtitle":
        opts.update({
            'skip_download': True,
            # data/download_sub -> origin_dir
            'outtmpl': os.path.join(path_manager.origin_dir, '%(title)s.%(ext)s'),
        })

    return opts

# =========================================================
# [4] 메인 실행 함수 (PathManager 인자 추가)
# =========================================================

async def download_video_full_async(url, path_manager):
    progress_hook_wrapper.last_file = None

    app_log.write(f"▶ [시작] 다운로드 요청: {url}", replace=False)

    ydl_opts = get_ydl_opts(path_manager, mode="full")

    try:
        video_title = None
        # yt-dlp의 실행 부분을 별도의 스레드에서 실행하도록 위임
        def run_yt_dlp():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # download=True일 경우 여기서 실제 다운로드가 일어남 (Blocking 발생 지점)
                return ydl.extract_info(url, download=True)

        # asyncio.to_thread를 사용하여 UI 프리징 방지
        info = await asyncio.to_thread(run_yt_dlp)
        
        video_title = info.get('title', '제목_없음')
        add_record(video_title, url)

        app_log.write("🎉 [성공] 모든 작업 완료!", replace=False)
        
        return video_title

    except Exception as e:
        app_log.write(f"❌ [오류] {str(e)}", replace=False)
        return None

def download_subtitle_only(url, path_manager):
    app_log.write(f"▶ [시작] 자막만 추출: {url}", replace=False)

    ydl_opts = get_ydl_opts(path_manager, mode="subtitle")

    try:
        video_title = None
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', '제목_없음')
            
        app_log.write("🎉 [완료] 자막 저장 끝!", replace=False)
            
        return video_title

    except Exception as e:
        app_log.write(f"❌ [오류] {e}", replace=False)
        return None