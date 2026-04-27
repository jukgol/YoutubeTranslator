import os
import sys

# Add Nvidia DLLs to path for Windows
def add_nvidia_dll_paths():
    if sys.platform == 'win32':
        # common paths in venv
        base_path = os.path.join(sys.prefix, 'Lib', 'site-packages', 'nvidia')
        cublas_bin = os.path.join(base_path, 'cublas', 'bin')
        cudnn_bin = os.path.join(base_path, 'cudnn', 'bin')
        
        paths_to_add = [cublas_bin, cudnn_bin]
        
        for p in paths_to_add:
            if os.path.exists(p):
                try:
                    os.add_dll_directory(p)
                    # Also add to PATH environment variable for robust loading
                    os.environ['PATH'] = p + os.pathsep + os.environ['PATH']
                    # print(f"[INFO] Added DLL directory: {p}", flush=True)
                except Exception as e:
                    print(f"[ERROR] Failed to add DLL directory {p}: {e}", flush=True)
            # else:
                # print(f"[INFO] DLL directory not found: {p}", flush=True)

        # Also try standard import output as backup
        try:
            import nvidia.cublas.lib
            import nvidia.cudnn.lib
            # Some versions might put DLLs in lib not bin or elsewhere
            # print(f"[INFO] nvidia.cublas.lib file: {nvidia.cublas.lib.__file__}", flush=True)
        except:
            pass

# Call immediately before importing faster_whisper
add_nvidia_dll_paths()

# faster_whisper import will be available after poetry install
try:
    from faster_whisper import WhisperModel
except ImportError:
    print("Error: faster-whisper module not found. Please run 'poetry install'.")
    sys.exit(1)

class SubtitleExtractor:
    def __init__(self, model_size="large-v3", device="cuda", compute_type="float16", model_dir=None):
        # add_nvidia_dll_paths() # Called at top level
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self.model_dir = model_dir
        self.model = None
        self._load_model(device)

    def _load_model(self, device):
        print(f"[INFO] Loading Whisper model: {self.model_size} on {device}...", flush=True)
        try:
            # compute_type adjustment for CPU
            compute_type = self.compute_type
            if device == "cpu":
                compute_type = "int8"
            
            # 모델 저장 경로 설정
            if self.model_dir:
                # setconfig/models/whisper 하위 폴더 생성
                final_model_dir = os.path.join(self.model_dir, "whisper")
            else:
                final_model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "setconfig", "models", "whisper")
            
            if not os.path.exists(final_model_dir):
                os.makedirs(final_model_dir, exist_ok=True)

            self.model = WhisperModel(self.model_size, device=device, compute_type=compute_type, download_root=final_model_dir)
            self.device = device
            print(f"[INFO] Model loaded successfully on {device}.", flush=True)
        except Exception as e:
            print(f"[ERROR] Error loading model on {device}: {e}", flush=True)
            if device == "cuda":
                print("[INFO] Falling back to CPU initialization...", flush=True)
                self._load_model("cpu")
            else:
                raise e

    def transcribe(self, audio_path, language=None, task="transcribe"):
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        print(f"[INFO] Starting transcription for: {audio_path} (Language: {language}, Task: {task})", flush=True)
        
        try:
            return self._run_transcribe(audio_path, language, task)
        except Exception as e:
            print(f"[INFO] GPU Acceleration failed: {e}. Switching to CPU...", flush=True) # Changed from ERROR to INFO
            if self.device == "cuda":
                print("[INFO] Attempting to switch to CPU and retry...", flush=True)
                try:
                    self._load_model("cpu")
                    return self._run_transcribe(audio_path, language, task)
                except Exception as retry_e:
                    print(f"[CRITICAL] Retry on CPU failed: {retry_e}", flush=True)
                    raise retry_e
            else:
                raise e

    def _run_transcribe(self, audio_path, language=None, task="transcribe"):
        # beam_size=5 is a common good default
        
        # Improve Chinese/Cantonese accuracy with initial prompt
        initial_prompt = None
        if language == 'zh':
            initial_prompt = "以下是普通话的句子。"
        elif language == 'yue':
            initial_prompt = "以下是广东话的句子。"

        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=5, 
            language=language, 
            task=task,
            initial_prompt=initial_prompt,
            condition_on_previous_text=False, # Prevent repetition loops (hallucinations)
            vad_filter=False, # BUG: vad_filter in faster-whisper causes timestamp stretching/dragging
            word_timestamps=True,
            log_prob_threshold=-0.8,
            no_speech_threshold=0.7, # Increased from 0.6 for stricter speech detection without VAD
            compression_ratio_threshold=2.4, # Prevent repetitive hallucination loops
        )

        print(f"[INFO] Detected language '{info.language}' with probability {info.language_probability:.2f}", flush=True)

        # Known hallucination phrases to filter out
        hallucination_phrases = [
            "优优独播剧场", "YoYo Television", "独播剧场"
            , "字幕", "Subtitles", "Amara.org", "MBC", "SBS", "TBS", "KBS"
            , "本节目由", "感谢观看", "Thanks for watching", "Please subscribe"            
            , "中文字幕志愿者 李宗盛", "请不吝点赞 订阅 转发 打赏支持明镜与点点栏目"
        ]

        results = []
        # Segments are a generator, so we iterate to process them
        for segment in segments:
            # Filter out known hallucinations
            if any(phrase in segment.text for phrase in hallucination_phrases):
                print(f"[INFO] Filtered hallucination: {segment.text}", flush=True)
                continue

            # Determine more precise end time using word timestamps if available
            segment_start = segment.start
            segment_end = segment.end
            
            if segment.words:
                segment_end = segment.words[-1].end
                # print(f"[DEBUG] Refined end time: {segment.end:.2f} -> {segment_end:.2f}", flush=True)

            # Calculate percentage
            percentage = 0.0
            if info.duration and info.duration > 0:
                percentage = (segment_end / info.duration) * 100
                if percentage > 100: percentage = 100.0

            # Print progress with percentage
            print(f"[PROGRESS] percentage={percentage:.1f} start={segment_start:.2f} end={segment_end:.2f} text={segment.text}", flush=True)
            
            # Create a modified segment object or just store the refined values
            # For simplicity in results, we'll store refined values in a dict or similar if needed,
            # but since save_to_srt uses results, let's update the segment object if it allows or store a custom object.
            # faster-whisper segments are typically namedtuples or similar, so we might need a wrapper.
            results.append({
                'start': segment_start,
                'end': segment_end,
                'text': segment.text
            })
        
        return results

    def save_to_srt(self, segments, output_path):
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                # Post-processing: Create artificial gaps between contiguous segments
                for i, segment in enumerate(segments):
                    # handle both dict (custom) and object (original) types
                    if isinstance(segment, dict):
                        start = segment['start']
                        end = segment['end']
                        text = segment['text']
                    else:
                        start = segment.start
                        end = segment.end
                        text = segment.text

                    fmt_start = self._format_timestamp(start)
                    fmt_end = self._format_timestamp(end)
                    
                    f.write(f"{i+1}\n")
                    f.write(f"{fmt_start} --> {fmt_end}\n")
                    f.write(f"{text.strip()}\n")
                    f.write("\n")
            print(f"[INFO] Saved subtitles to: {output_path}")
        except Exception as e:
            print(f"[ERROR] Failed to save SRT: {e}")

    def _format_timestamp(self, seconds):
        if seconds is None:
            return "00:00:00,000"
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
