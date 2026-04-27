import os
import sys
import argparse

def download_sense_model(model_id, model_dir):
    try:
        from modelscope.hub.snapshot_download import snapshot_download
        import tqdm
        # tqdm의 기본 포맷을 소수점 둘째 자리까지 표시하도록 변경
        orig_tqdm = tqdm.tqdm
        def new_tqdm(*args, **kwargs):
            if 'bar_format' not in kwargs:
                kwargs['bar_format'] = '{desc}: {percentage:5.2f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}{postfix}]'
            return orig_tqdm(*args, **kwargs)
        tqdm.tqdm = new_tqdm
    except ImportError:
        print("[ERROR] modelscope module not found.")
        sys.exit(1)

    print(f"[INFO] SenseVoice 모델 다운로드 시작: {model_id}")
    
    # 저장 경로 설정
    if model_dir:
        final_model_dir = os.path.join(model_dir, "sense")
    else:
        # Fallback
        final_model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "setconfig", "models", "sense")
    
    os.makedirs(final_model_dir, exist_ok=True)
    os.environ['MODELSCOPE_CACHE'] = final_model_dir
    os.environ["TQDM_MININTERVAL"] = "0.5"
    
    # 모델 다운로드 수행
    snapshot_download(model_id)
    
    print(f"[DONE] SenseVoice 모델 다운로드 완료: {final_model_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="iic/SenseVoiceSmall")
    parser.add_argument("--model_dir")
    args = parser.parse_args()
    
    download_sense_model(args.model, args.model_dir)
