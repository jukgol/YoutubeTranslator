import argparse
import sys
import os

def main():
    # Setup argument parser to receive commands from Electron
    parser = argparse.ArgumentParser(description="YoutubeTranslator Python Backend")
    parser.add_argument("--file", help="Path to the media file to transcribe")
    parser.add_argument("--download_only", action="store_true", help="Only download the model and exit")
    parser.add_argument("--engine", default="sense", choices=["whisper", "sense"], help="STT engine to use (whisper, sense)")
    parser.add_argument("--model", help="Model name or size (e.g. large-v3 for whisper, iic/SenseVoiceSmall for sense)")
    parser.add_argument("--model_dir", help="Directory where models are stored")
    parser.add_argument("--device", default="cuda", help="Device to use (cuda, cpu)")
    parser.add_argument("--output", help="Optional output directory. Defaults to same as input file.")
    parser.add_argument("--language", help="Language code (e.g. en, ko, ja, zh)")
    parser.add_argument("--task", default="transcribe", help="Task: transcribe (source lang) or translate (to English)")

    args = parser.parse_args()

    input_file = args.file
    
    # 0. Engine specific defaults and imports
    if args.engine == "sense":
        from sense_worker import SubtitleExtractor
        if not args.model:
            args.model = "iic/SenseVoiceSmall"
    else:
        from whisper_worker import SubtitleExtractor
        if not args.model:
            args.model = "large-v3"

    # 1. Validate Input (if not download_only)
    if not args.download_only:
        if not input_file:
            print("[ERROR] --file is required if not using --download_only")
            sys.exit(1)
        if not os.path.exists(input_file):
            print(f"[ERROR] File not found: {input_file}")
            sys.exit(1)

    # 2. Determine Output Path (only if file is provided)
    output_path = None
    if input_file:
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
        # 4. Download Only Case: Use dedicated downloader scripts
        if args.download_only:
            if args.engine == "sense":
                import sense_downloader
                sense_downloader.download_sense_model(args.model, args.model_dir)
            else:
                import whisper_downloader
                whisper_downloader.download_whisper_model(args.model, args.model_dir)
            sys.exit(0)

        # 5. Initialize Extractor (For actual transcription)
        extractor = SubtitleExtractor(model_size=args.model, device=args.device, model_dir=args.model_dir)
        
        # 6. Run Transcription
        lang = args.language if args.language else "auto"
        segments = extractor.transcribe(input_file, language=lang, task=args.task)
        
        # 6. Save Result
        extractor.save_to_srt(segments, output_path)
        
        sys.exit(0)
        
    except Exception as e:
        print(f"[CRITICAL] An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
