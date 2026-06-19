@echo off
echo ========================================
echo   KHOI DONG SERVER ON DINH (PRODUCTION)
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Xoa cache...
if exist ".next" (
    rmdir /s /q .next
    echo [OK] Da xoa cache
)

echo.
echo [2/3] Build production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build that bai!
    pause
    exit /b 1
)

echo.
echo [3/3] Khoi dong production server...
echo.
echo ========================================
echo   SERVER ON DINH DANG CHAY TAI:
echo   http://localhost:3000
echo ========================================
echo.
echo Production server ON DINH hon dev server!
echo Nhan Ctrl+C de dung server
echo.

call npm start

pause
