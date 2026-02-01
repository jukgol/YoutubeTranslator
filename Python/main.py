import argparse
import sys
import os
from whisper_worker import SubtitleExtractor

def main():
    # Setup argument parser to receive commands from Electron
    parser = argparse.ArgumentParser(description="YoutubeTranslator Python Backend")
    parser.add_argument("--file", required=True, help="Path to the media file to transcribe")
    parser.add_argument("--model", default="large-v3", help="Whisper model size (tiny, base, small, medium, large-v3)")
    parser.add_argument("--device", default="cuda", help="Device to use (cuda, cpu)")
    parser.add_argument("--output", help="Optional output directory. Defaults to same as input file.")
    parser.add_argument("--language", help="Language code (e.g. en, ko, ja, zh)")
    parser.add_argument("--task", default="transcribe", help="Task: transcribe (source lang) or translate (to English)")

    args = parser.parse_args()

    input_file = args.file
    
    # 1. Validate Input
    if not os.path.exists(input_file):
        print(f"[ERROR] File not found: {input_file}")
        sys.exit(1)

    # 2. Determine Output Path
    if args.output:
        output_dir = args.output
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
    else:
        output_dir = os.path.dirname(input_file)

    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_path = os.path.join(output_dir, f"{base_name}.srt")

    # 3. Check if output already exists (Skip if so)
    if os.path.exists(output_path):
        print(f"[INFO] Subtitle file already exists: {output_path}")
        print("[DONE] Skipping transcription.")
        sys.exit(0)

    try:
        # 4. Initialize Extractor
        extractor = SubtitleExtractor(model_size=args.model, device=args.device)
        
        # 5. Run Transcription
        segments = extractor.transcribe(input_file, language=args.language, task=args.task)
        
        # 6. Save Result
        extractor.save_to_srt(segments, output_path)
        
        print("[DONE] Transcription complete.")
        sys.exit(0) # Explicitly exit with 0 to ensure Electron sees success
        
    except Exception as e:
        print(f"[CRITICAL] An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
