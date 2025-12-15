@echo off
REM Toggle Frontend Environment - Switch to PRODUCTION
echo ========================================
echo   Switching to PRODUCTION environment
echo ========================================
cd /d "%~dp0"
echo VITE_API_URL=https://projecte-n-joy.vercel.app> .env
echo.
echo ✅ Frontend now points to: https://projecte-n-joy.vercel.app
echo.
echo You need to restart the dev server (npm run dev) for changes to take effect.
pause
