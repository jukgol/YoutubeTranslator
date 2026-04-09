import google.generativeai as genai
import os

api_key = "AIzaSyDhioEhOAppKNKvmu2uJ0H9E5SsYAjNev4"

def list_gemini_models():
    try:
        genai.configure(api_key=api_key)
        models = genai.list_models()
        
        with open("../gemini_models_list.txt", "w", encoding="utf-8") as f:
            f.write("Available Gemini API Models:\n")
            f.write("=" * 30 + "\n")
            for m in models:
                if 'generateContent' in m.supported_generation_methods:
                    f.write(f"{m.name}\n")
                    f.write(f"  Description: {m.description}\n")
                    f.write(f"  Input types: {m.input_token_limit}\n")
                    f.write("-" * 30 + "\n")
        
        print("Successfully saved model list to gemini_models_list.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_gemini_models()
