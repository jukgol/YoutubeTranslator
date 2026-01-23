class AppConfig:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AppConfig, cls).__new__(cls)
            # Initialize attributes only once
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        # 1. 인증 관련 정보 (Auth Group)
        self.api_keys = []           # 전체 API 키 리스트
        self.selected_api = ""       # 현재 선택된 API 키
        self.cookies = ""            # 세션 쿠키 정보

        # 2. 로직 설정 정보 (Context Group)
        self.prompt_rule = ""        # 번역 규칙/프롬프트 내용
        self.model_version = ""      # Gemini 모델 버전 (예: gemini-1.5-pro)

        # 3. 기타 상태 정보
        self.is_running = False      # 현재 공정 실행 여부 플래그
        
        self._initialized = True

# Create a module-level instance that can be imported
# This makes AppConfig effectively a singleton for the module
app_config = AppConfig()