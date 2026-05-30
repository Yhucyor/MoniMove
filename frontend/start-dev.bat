@echo off
echo ========================================
echo   KHOI DONG SERVER MONIMOVE
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Kiem tra Node.js...
node --version
if errorlevel 1 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long cai Node.js tu: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2/3] Kiem tra dependencies...
if not exist "node_modules" (
    echo [WARNING] node_modules chua ton tai!
    echo Dang cai dat dependencies...
    call npm install
)

echo.
echo [3/3] Khoi dong dev server...
echo.
echo ========================================
echo   SERVER DANG CHAY TAI:
echo   http://localhost:3000
echo ========================================
echo.
echo Nhan Ctrl+C de dung server
echo.

call npm run dev

pause
