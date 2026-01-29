// Electron/main/appEnv/configData.js - Moved from config/config.js

// This object will be a singleton due to Node.js module caching
const appConfig = {
    // 1. 인증 관련 정보 (Auth Group)
    apiKeys: [],           // 전체 API 키 리스트
    selectedApi: "",       // 현재 선택된 API 키
    cookies: "",            // 세션 쿠키 정보

    // 2. 로직 설정 정보 (Context Group)
    promptRule: "",        // 번역 규칙/프롬프트 내용
    modelVersion: "",      // Gemini 모델 버전 (예: gemini-1.5-pro)

    // 3. 기타 상태 정보
    isRunning: false,      // 현재 공정 실행 여부 플래그
};

module.exports = appConfig;
