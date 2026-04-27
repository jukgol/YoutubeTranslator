@echo off
setlocal
cd /d "%~dp0.."

echo ========================================
echo   YoutubeTranslator Build Test (Admin)
echo ========================================

echo [1/1] Building Portable EXE...
echo (This may take a few minutes.)

:: Set environment to skip signing
set CSC_SKIP=true

:: Run build
call npm run build

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed. Make sure you ran this as ADMIN.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build complete! Check the 'release' folder.
pause
