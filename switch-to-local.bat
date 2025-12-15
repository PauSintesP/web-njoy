@echo off
REM Toggle Frontend Environment - Switch to LOCAL
echo ========================================
echo   Switching to LOCAL environment
echo ========================================
cd /d "%~dp0"
echo VITE_API_URL=http://localhost:8000> .env
echo.
echo ✅ Frontend now points to: http://localhost:8000
echo.
echo You need to restart the dev server (npm run dev) for changes to take effect.
pause
