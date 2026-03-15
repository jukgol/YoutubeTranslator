import argparse
import sys
import os
import yt_dlp

def progress_hook(d):
    if d['status'] == 'downloading':
        p_str = d.get('_percent_str', '0.0%').replace('%', '').strip()
        try:
            p_val = float(p_str)
        except ValueError:
            p_val = 0.0

        # Only print if it's the first call or if the percentage changed meaningfully (e.g., 0.1%)
        last_p = getattr(progress_hook, 'last_p', -1.0)
        if p_val - last_p >= 0.1 or p_val >= 99.9 or p_val == 0.0:
            s = d.get('_total_bytes_str') or d.get('_total_bytes_estimate_str', 'Unknown')
            # Flush to ensure Electron receives it promptly
            print(f"[PROGRESS] {p_str}% of {s}", flush=True)
            progress_hook.last_p = p_val
    elif d['status'] == 'finished':
        print("[INFO] Download complete, now post-processing...", flush=True)

def run_download(url, output_tmpl, format_opt, write_subs, write_auto_subs, cookie_file=None):
    # Standard settings matching the JS downloadHelper.js implementation
    ydl_opts = {
        'format': format_opt,
        'outtmpl': output_tmpl,
        'progress_hooks': [progress_hook],
        'nocheckcertificate': True,
        'quiet': True,
        'no_warnings': True,
        # Match JS environment User-Agent
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    }

    # Add cookie file if provided
    if cookie_file and os.path.exists(cookie_file):
        ydl_opts['cookiefile'] = os.path.abspath(cookie_file)
        print(f"[INFO] Using cookie file: {ydl_opts['cookiefile']}")

    # Match JS environment Referer
    if "youtube.com" in url or "youtu.be" in url:
        ydl_opts['referer'] = 'https://www.youtube.com/'

    if write_subs:
        ydl_opts['writesubtitles'] = True
        ydl_opts['writeautomaticsub'] = write_auto_subs
        ydl_opts['subtitleslangs'] = ['zh-Hans', 'en', 'ko', 'id', 'zh']
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegSubtitlesConvertor',
            'format': 'srt',
        }]

    print(f"[INFO] Running download with updated yt-dlp library for: {url}")
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print("[DONE] Download finished successfully.")
        return True
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="YoutubeTranslator Downloader Backend")
    parser.add_argument("--url", required=True, help="URL to download")
    parser.add_argument("--output", required=True, help="Output template")
    parser.add_argument("--format", default="bestvideo+bestaudio/best", help="Format option")
    parser.add_argument("--subs", action="store_true", help="Download subtitles")
    parser.add_argument("--autosubs", action="store_true", help="Download auto-generated subtitles")
    parser.add_argument("--cookies", help="Path to cookie file")

    args = parser.parse_args()

    success = run_download(
        args.url,
        args.output,
        args.format,
        args.subs,
        args.autosubs,
        args.cookies
    )

    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
