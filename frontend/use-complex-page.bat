@echo off
echo ========================================
echo   QUAY LAI TRANG PHUC TAP
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Khoi phuc trang phuc tap...
if exist "app\page-complex.tsx.backup" (
    copy /Y "app\page-complex.tsx.backup" "app\page.tsx"
    echo [OK] Da khoi phuc trang phuc tap
) else (
    echo [ERROR] Khong tim thay backup
    pause
    exit /b 1
)

echo.
echo ========================================
echo   HOAN THANH!
echo ========================================
echo.
echo Trang phuc tap da duoc khoi phuc.
echo.
echo Restart server de xem thay doi.
echo.

pause
