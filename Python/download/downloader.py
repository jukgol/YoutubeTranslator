import argparse
import sys
import os
import subprocess
import re

def run_download(url, output_tmpl, format_opt, write_subs, write_auto_subs, cookie_file=None):
    # Find the yt-dlp binary from node_modules
    # downloader.py is in Python/download/
    # binary is in node_modules/yt-dlp-exec/bin/yt-dlp.exe
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    binary_path = os.path.join(project_root, "node_modules", "yt-dlp-exec", "bin", "yt-dlp.exe")
    
    if not os.path.exists(binary_path):
        print(f"[ERROR] yt-dlp binary not found at: {binary_path}")
        return False

    # Construct arguments
    args = [
        binary_path,
        url,
        "--format", format_opt,
        "--output", output_tmpl,
        "--no-check-certificates",
        "--js-runtimes", "node",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "--newline",
        "--progress",
        "--no-playlist",
    ]

    # Add Referer
    if "youtube.com" in url or "youtu.be" in url:
        args.extend(["--referer", "https://www.youtube.com/"])
    elif "dailymotion.com" in url or "dai.ly" in url:
        args.extend(["--referer", "https://www.dailymotion.com/"])

    # Add cookies if provided (skip for Dailymotion to avoid 401 error)
    # The Electron handler already filters this, but just in case
    is_dailymotion = "dailymotion.com" in url or "dai.ly" in url
    if cookie_file and os.path.exists(cookie_file) and not is_dailymotion:
        args.extend(["--cookies", os.path.abspath(cookie_file)])
        print(f"[INFO] Using cookie file: {cookie_file}")

    if write_subs:
        args.append("--write-subs")
        if write_auto_subs:
            args.append("--write-auto-subs")
        args.extend(["--sub-langs", "zh-Hans,en,ko,id,zh"])
        args.extend(["--convert-subs", "srt"])

    print(f"[INFO] Running download using binary: {binary_path} for: {url}")
    
    try:
        # Start subprocess
        process = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1
        )

        # Progress regex: [download]  10.5% of 100.00MiB at ... (Size can have ~)
        progress_re = re.compile(r"\[download\]\s+(\d+\.\d+)%\s+of\s+([~\w\.]+)")

        for line in process.stdout:
            line = line.strip()
            if not line:
                continue
            
            # Match progress
            match = progress_re.search(line)
            if match:
                percent = match.group(1)
                size = match.group(2)
                # Matches Electron's parser: [PROGRESS] 10.5% of 100MiB
                print(f"[PROGRESS] {percent}% of {size}", flush=True)
            elif "ERROR:" in line:
                print(f"[ERROR] {line}", flush=True)
            # You can add more info filters here if needed

        process.wait()
        
        if process.returncode == 0:
            print("[DONE] Download finished successfully.")
            return True
        else:
            print(f"[ERROR] Process exited with code {process.returncode}")
            return False

    except Exception as e:
        print(f"[ERROR] Exception during execution: {str(e)}")
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
