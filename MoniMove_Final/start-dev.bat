@echo off
echo ========================================
echo   MoniMove Final - Starting Dev Mode
echo ========================================
echo.

echo Starting Backend (port 3001)...
start "MoniMove Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend (port 3000)...
start "MoniMove Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Services started!
echo   Backend:  http://localhost:3001
echo   API Docs: http://localhost:3001/api/docs
echo   Frontend: http://localhost:3000
echo ========================================
