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
    def __init__(self, model_size="large-v3", device="cuda", compute_type="float16"):
        # add_nvidia_dll_paths() # Called at top level
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self.model = None
        self._load_model(device)

    def _load_model(self, device):
        print(f"[INFO] Loading Whisper model: {self.model_size} on {device}...", flush=True)
        try:
            # compute_type adjustment for CPU
            compute_type = self.compute_type
            if device == "cpu":
                compute_type = "int8"
            
            self.model = WhisperModel(self.model_size, device=device, compute_type=compute_type)
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
            no_speech_threshold=0.6, # Adjust threshold to be less sensitive to silence
            vad_filter= False, # 소리 없는 구간을 물리적으로 제거
            vad_parameters=dict(min_silence_duration_ms=500), # 0.5초 이상 조용하면 자막 끊기
            word_timestamps=True,
        )

        print(f"[INFO] Detected language '{info.language}' with probability {info.language_probability:.2f}", flush=True)

        results = []
        # Segments are a generator, so we iterate to process them
        for segment in segments:
            # Calculate percentage
            percentage = 0.0
            if info.duration and info.duration > 0:
                percentage = (segment.end / info.duration) * 100
                if percentage > 100: percentage = 100.0

            # Print progress with percentage
            print(f"[PROGRESS] percentage={percentage:.1f} start={segment.start:.2f} end={segment.end:.2f} text={segment.text}", flush=True)
            results.append(segment)
        
        return results

    def save_to_srt(self, segments, output_path):
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                # Post-processing: Create artificial gaps between contiguous segments
                for i, segment in enumerate(segments):
                    start = segment.start
                    end = segment.end

                    fmt_start = self._format_timestamp(start)
                    fmt_end = self._format_timestamp(end)
                    
                    f.write(f"{i+1}\n")
                    f.write(f"{fmt_start} --> {fmt_end}\n")
                    f.write(f"{segment.text.strip()}\n")
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
