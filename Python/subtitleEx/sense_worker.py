import os
import sys
import datetime
import logging
import warnings

# Silence all internal library warnings and root logs
warnings.filterwarnings("ignore")
logging.getLogger().setLevel(logging.CRITICAL)

# Add Nvidia DLLs to path for Windows
def add_nvidia_dll_paths():
    if sys.platform == 'win32':
        base_path = os.path.join(sys.prefix, 'Lib', 'site-packages', 'nvidia')
        cublas_bin = os.path.join(base_path, 'cublas', 'bin')
        cudnn_bin = os.path.join(base_path, 'cudnn', 'bin')
        
        paths_to_add = [cublas_bin, cudnn_bin]
        
        for p in paths_to_add:
            if os.path.exists(p):
                try:
                    os.add_dll_directory(p)
                    os.environ['PATH'] = p + os.pathsep + os.environ['PATH']
                except Exception as e:
                    print(f"[ERROR] Failed to add DLL directory {p}: {e}", flush=True)

# Call immediately before importing funasr
add_nvidia_dll_paths()

try:
    from funasr import AutoModel
except ImportError:
    print("Error: funasr module not found. Please run 'poetry install'.")
    sys.exit(1)

import tqdm
# Monkeypatch tqdm to show float percentage (e.g. 93.1%) instead of integers
def _patch_tqdm_init(original_init):
    def new_init(self, *args, **kwargs):
        if 'bar_format' not in kwargs or kwargs['bar_format'] is None:
            # Custom format with {percentage:3.1f}%
            kwargs['bar_format'] = '{desc}: {percentage:3.1f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}{postfix}]'
        original_init(self, *args, **kwargs)
    return new_init

tqdm.tqdm.__init__ = _patch_tqdm_init(tqdm.tqdm.__init__)

class SubtitleExtractor:
    def __init__(self, model_size="iic/SenseVoiceSmall", device="cuda", compute_type="float16"):
        self.model_name = model_size
        self.device = device
        self.asr_model = None
        self.vad_model = None
        self._load_models(device)

    def _load_models(self, device):
        import os
        import logging
        import sys
        import threading
        import time

        # 1. Background thread to show activity with dots on the same line (using \r)
        stop_loading_event = threading.Event()
        def print_dots():
            dot_count = 1
            while not stop_loading_event.is_set():
                dots = "." * dot_count
                # Use \r to return to start of line and print
                # We use sys.__stdout__ to ensure it goes to the real stdout stream
                sys.__stdout__.write(f"\r[INFO] 자막 작업을 준비 중입니다{dots}   ")
                sys.__stdout__.flush()
                dot_count = (dot_count % 3) + 1
                time.sleep(1)
            sys.__stdout__.write("\n") # New line when loading is done
            sys.__stdout__.flush()
        
        dot_thread = threading.Thread(target=print_dots, daemon=True)
        
        # 2. Set library log levels to silence them as much as possible
        os.environ["MODELSCOPE_LOG_LEVEL"] = "50" 
        os.environ["FUNASR_LOG_LEVEL"] = "ERROR"
        os.environ["TQDM_MININTERVAL"] = "10.0" 
        
        for logger_name in ["funasr", "modelscope", "mslib"]:
            logging.getLogger(logger_name).setLevel(logging.CRITICAL)

        class suppress_output:
            def __enter__(self):
                self._original_stdout = sys.stdout
                self._original_stderr = sys.stderr
                sys.stdout = open(os.devnull, 'w')
                sys.stderr = open(os.devnull, 'w')
            def __exit__(self, exc_type, exc_val, exc_tb):
                sys.stdout.close()
                sys.stderr.close()
                sys.stdout = self._original_stdout
                sys.stderr = self._original_stderr

        try:
            dot_thread.start()
            with suppress_output():
                self.asr_model = AutoModel(
                    model=self.model_name,
                    device=device,
                    disable_update=True,
                    trust_remote_code=False 
                )
                
                self.vad_model = AutoModel(
                    model="iic/speech_fsmn_vad_zh-cn-16k-common-pytorch",
                    device=device,
                    disable_update=True,
                    trust_remote_code=False
                )
            
            self.device = device
            stop_loading_event.set()
            dot_thread.join(timeout=1)
            
        except Exception as e:
            stop_loading_event.set()
            # If suppress_output fails or error occurs, ensure we can see the error
            print(f"\n[ERROR] 자막 모델 로드 실패: {e}", flush=True)
            if device == "cuda":
                self._load_models("cpu")
            else:
                raise e

    def transcribe(self, audio_path, language="auto", task="transcribe"):
        try:
            duration = self._get_audio_duration(audio_path)

            audio_data = self._load_audio_to_numpy(audio_path, sr=16000)
            
            # Step A: Run VAD with tightened parameters
            vad_res = self.vad_model.generate(
                input=audio_data,
                max_single_segment_time= 1000, # 3s as requested
                max_end_silence_time=500, # 0.5s as requested
                speech_threshold=0.8, # Tightened from 0.5 (ignores noises like water drops)
                min_speech_duration_ms=300, # Ignores pops/clicks shorter than 0.3s
                disable_pbar=True
            )
            
            if not vad_res or len(vad_res) == 0:
                print("[WARNING] No speech segments detected.", flush=True)
                return []
            
            segments_info = vad_res[0].get("value", [])

            results = []
            
            # Step B: Transcribe each segment using in-memory slices
            from tqdm import tqdm
            pbar = tqdm(total=len(segments_info), desc="Transcribing segments")
            
            for i, seg in enumerate(segments_info):
                beg_ms, end_ms = seg[0], seg[1]
                
                start_sample = int(beg_ms * 16)
                end_sample = int(end_ms * 16)
                end_sample = min(end_sample, len(audio_data))
                
                if start_sample >= end_sample:
                    continue
                    
                chunk = audio_data[start_sample:end_sample]
                
                res = self.asr_model.generate(
                    input=chunk,
                    language=language,
                    use_itn=True,
                    disable_pbar=True
                )
                
                if res and len(res) > 0:
                    raw_output = res[0].get("text", "")
                    
                    # 1. Hallucination/Noise Filter
                    # If model explicitly marks noise or non-speech, and text is suspiciously short, discard it.
                    is_noise = "<|NOISE|>" in raw_output or "<|SPEECH|>" not in raw_output and "<|zh|>" not in raw_output
                    text = self._clean_text(raw_output)
                    
                    # Discard if noise-heavy or only short punctuations
                    if is_noise and len(text) <= 2:
                        continue
                    
                    # 2. Final Substantive Check
                    import re
                    # Must contain at least one meaningful character (excluding just '에?' for noise)
                    if text:
                        # If the segment is very short AND was potentially noise, skip
                        if (end_ms - beg_ms) < 400 and is_noise:
                            continue
                            
                        results.append({
                            'start': beg_ms / 1000.0,
                            'end': end_ms / 1000.0,
                            'text': text
                        })
                        self._print_progress(beg_ms / 1000.0, end_ms / 1000.0, text, duration)
                
                pbar.update(1)
            pbar.close()
            
            return results

        except Exception as e:
            print(f"[ERROR] Transcription failed: {e}", flush=True)
            raise e

    def _load_audio_to_numpy(self, audio_path, sr=16000):
        import subprocess
        import numpy as np
        cmd = [
            'ffmpeg', '-v', 'error', '-i', audio_path,
            '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '1', '-ar', str(sr), 'pipe:1'
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode != 0:
            raise Exception(f"FFmpeg audio loading failed: {result.stderr.decode()}")
        return np.frombuffer(result.stdout, dtype=np.float32)

    def _print_progress(self, start_sec, end_sec, text, duration):
        percentage = 0.0
        if duration > 0:
            percentage = (end_sec / duration) * 100
            if percentage > 100: percentage = 100.0
        print(f"[PROGRESS] percentage={percentage:.2f} start={start_sec:.2f} end={end_sec:.2f} text={text}", flush=True)

    def save_to_srt(self, segments, output_path):
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                for i, segment in enumerate(segments):
                    start = segment['start']
                    end = segment['end']
                    text = segment['text']

                    fmt_start = self._format_timestamp(start)
                    fmt_end = self._format_timestamp(end)
                    
                    f.write(f"{i+1}\n")
                    f.write(f"{fmt_start} --> {fmt_end}\n")
                    f.write(f"{text.strip()}\n")
                    f.write("\n")
            print(f"[DONE] 자막 작업이 완료되었습니다.")
        except Exception as e:
            print(f"[ERROR] Failed to save SRT: {e}")

    def _format_timestamp(self, seconds):
        if seconds is None:
            return "00:00:00,000"
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int(round((seconds - int(seconds)) * 1000))
        if millis >= 1000:
            millis = 999 
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def _clean_text(self, text):
        import re
        if not text:
            return ""
        # 1. Remove all special tags
        text = re.sub(r'<\|.*?\|>', '', text)
        
        # 2. Remove emojis and symbols
        try:
            text = re.sub(r'[\U00010000-\U0010ffff]', '', text)
            text = re.sub(r'[\u2600-\u27bf]', '', text)
        except Exception:
            pass
        
        # 3. Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # 4. Final filter: If text consists only of punctuation used for noise (e.g. "。"), clear it
        if text and not re.search(r'[\w\u4e00-\u9fff]', text):
            return ""
            
        return text

    def _get_audio_duration(self, audio_path):
        import subprocess
        try:
            cmd = [
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', audio_path
            ]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception as e:
            print(f"[WARNING] Could determine duration: {e}", flush=True)
        return 0
