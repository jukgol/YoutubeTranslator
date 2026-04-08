from modelscope import snapshot_download
import os

def download_model():
    model_id = 'iic/SenseVoiceSmall'
    # Try to download to the standard cache location
    print(f"[DEBUG] Downloading model {model_id} using snapshot_download...")
    try:
        model_dir = snapshot_download(model_id, cache_dir='C:/Users/youmg/.cache/modelscope/hub')
        print(f"[DEBUG] Downloaded to: {model_dir}")
        # List files to verify
        files = os.listdir(model_dir)
        print(f"[DEBUG] Files in directory: {files}")
        if 'model.py' in files:
            print("[DEBUG] Success: model.py found.")
        else:
            print("[DEBUG] Failure: model.py STILL missing.")
    except Exception as e:
        print(f"[ERROR] Download failed: {e}")

if __name__ == "__main__":
    download_model()
