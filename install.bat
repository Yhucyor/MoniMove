@echo off
echo ========================================
echo   MoniMove Final - Install Dependencies
echo ========================================
echo.

echo [1/2] Installing Backend dependencies...
cd /d %~dp0backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)
echo Backend dependencies installed OK.

echo.
echo [2/2] Installing Frontend dependencies...
cd /d %~dp0frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend npm install failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed OK.

echo.
echo ========================================
echo   All dependencies installed!
echo   Run start-dev.bat to start the app.
echo ========================================
pause
