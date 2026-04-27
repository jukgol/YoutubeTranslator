@echo off
@chcp 65001 > nul
setlocal
cd /d "%~dp0.."

echo ========================================
echo   YoutubeTranslator 로컬 빌드 테스트
echo ========================================

echo.
echo [1/1] 로컬 빌드 시작 (업로드 안함, 서명 스킵)...
echo (결과물은 프로젝트 루트의 'release' 폴더에 생성됩니다.)
echo.

:: 서명 단계를 완전히 건너뛰도록 설정
set CSC_SKIP=true

:: 로컬 빌드만 실행 (publish 옵션 제외)
call npm run build

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] 빌드 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   빌드가 완료되었습니다!
echo   'release' 폴더를 확인하세요.
echo ========================================
pause
