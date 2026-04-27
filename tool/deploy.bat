@echo off
setlocal
cd /d "%~dp0.."

echo ========================================
echo   YoutubeTranslator 배포 도구
echo ========================================

:: 깃허브 토큰 확인 (환경변수에 없으면 직접 입력 받음)
if "%GH_TOKEN%"=="" (
    echo [!] 깃허브 배포를 위해 GitHub Personal Access Token이 필요합니다.
    set /p GH_TOKEN="GitHub Token을 입력하세요: "
)

if "%GH_TOKEN%"=="" (
    echo [ERROR] 토큰이 입력되지 않았습니다. 배포를 중단합니다.
    pause
    exit /b 1
)

echo.
echo [1/3] 버전 업데이트 중...
call npm version patch --no-git-tag-version

echo.
echo [2/3] 앱 빌드 및 깃허브 업로드 시작...
echo (파이썬 환경을 포함하므로 시간이 다소 소요될 수 있습니다.)
echo.

:: 빌드 및 업로드 명령 실행
set "GH_TOKEN=%GH_TOKEN%"
call npm run build -- --publish always

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] 빌드 또는 업로드 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   배포가 성공적으로 완료되었습니다!
echo   GitHub 저장소의 Releases 섹션을 확인하세요.
echo ========================================
pause
