import os
import sys
import argparse

def download_whisper_model(model_size, model_dir):
    try:
        from faster_whisper import download_model
        import tqdm
        # tqdm의 기본 포맷을 소수점 둘째 자리까지 표시하도록 변경
        orig_tqdm = tqdm.tqdm
        def new_tqdm(*args, **kwargs):
            if 'bar_format' not in kwargs:
                kwargs['bar_format'] = '{desc}: {percentage:5.2f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}{postfix}]'
            return orig_tqdm(*args, **kwargs)
        tqdm.tqdm = new_tqdm
    except ImportError:
        print("[ERROR] faster-whisper module not found.")
        sys.exit(1)

    print(f"[INFO] Whisper 모델 다운로드 시작: {model_size}")
    
    # 저장 경로 설정
    if model_dir:
        final_model_dir = os.path.join(model_dir, "whisper")
    else:
        # Fallback
        final_model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "setconfig", "models", "whisper")
    
    os.makedirs(final_model_dir, exist_ok=True)
    os.environ["TQDM_MININTERVAL"] = "0.5"
    
    # 모델 다운로드 수행
    download_model(model_size, output_dir=final_model_dir)
    
    print(f"[DONE] Whisper 모델 다운로드 완료: {final_model_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="large-v3")
    parser.add_argument("--model_dir")
    args = parser.parse_args()
    
    download_whisper_model(args.model, args.model_dir)
