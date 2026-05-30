@echo off
echo ========================================
echo   CHUYEN SANG TRANG DON GIAN
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Backup trang phuc tap...
if exist "app\page.tsx" (
    copy /Y "app\page.tsx" "app\page-complex.tsx.backup"
    echo [OK] Da backup: page-complex.tsx.backup
)

echo.
echo [2] Chuyen sang trang don gian...
if exist "app\page-simple.tsx" (
    copy /Y "app\page-simple.tsx" "app\page.tsx"
    echo [OK] Da chuyen sang trang don gian
) else (
    echo [ERROR] Khong tim thay page-simple.tsx
    pause
    exit /b 1
)

echo.
echo ========================================
echo   HOAN THANH!
echo ========================================
echo.
echo Trang don gian da duoc kich hoat.
echo.
echo Buoc tiep theo:
echo 1. Restart server (Ctrl+C roi chay lai npm run dev)
echo 2. Truy cap: http://localhost:3000
echo 3. Ban se thay trang don gian
echo.
echo De quay lai trang phuc tap, chay: use-complex-page.bat
echo.

pause
