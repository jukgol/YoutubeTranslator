@echo off
setlocal
cd /d "%~dp0.."

echo ========================================
echo   YoutubeTranslator Deployment Tool
echo ========================================

:: Check GitHub Token
if "%GH_TOKEN%"=="" (
    echo [!] GH_TOKEN is not set.
    set /p GH_TOKEN="Please enter your GitHub Token: "
)

if "%GH_TOKEN%"=="" (
    echo [ERROR] GH_TOKEN is required. Aborting.
    pause
    exit /b 1
)

echo [1/3] Bumping version...
call npm version patch --no-git-tag-version

echo [2/3] Building and Publishing to GitHub...
set "GH_TOKEN=%GH_TOKEN%"
set CSC_SKIP=true
call npm run build -- --publish always

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Deployment failed.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployment complete! Check GitHub Releases.
pause
