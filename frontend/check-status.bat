@echo off
echo ========================================
echo   KIEM TRA TRANG THAI MONIMOVE
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Kiem tra Node.js...
node --version
if errorlevel 1 (
    echo [X] Node.js CHUA duoc cai dat
) else (
    echo [OK] Node.js da cai dat
)

echo.
echo [2] Kiem tra npm...
call npm --version
if errorlevel 1 (
    echo [X] npm CHUA hoat dong
) else (
    echo [OK] npm da hoat dong
)

echo.
echo [3] Kiem tra dependencies...
if exist "node_modules" (
    echo [OK] node_modules da ton tai
) else (
    echo [X] node_modules CHUA ton tai - Can chay: npm install
)

echo.
echo [4] Kiem tra file .env.local...
if exist ".env.local" (
    echo [OK] .env.local da ton tai
) else (
    echo [X] .env.local CHUA ton tai - Can tao file nay
)

echo.
echo [5] Kiem tra port 3000...
netstat -ano | findstr :3000 > nul
if errorlevel 1 (
    echo [X] Port 3000 CHUA duoc su dung - Server chua chay
) else (
    echo [OK] Port 3000 dang duoc su dung - Server dang chay
)

echo.
echo [6] Kiem tra file quan trong...
if exist "package.json" (
    echo [OK] package.json
) else (
    echo [X] package.json THIEU
)

if exist "next.config.ts" (
    echo [OK] next.config.ts
) else (
    echo [X] next.config.ts THIEU
)

if exist "app\page.tsx" (
    echo [OK] app\page.tsx
) else (
    echo [X] app\page.tsx THIEU
)

echo.
echo ========================================
echo   KET QUA KIEM TRA
echo ========================================
echo.
echo Neu tat ca deu [OK], ban co the truy cap:
echo   http://localhost:3000
echo.
echo Neu co [X], hay sua loi truoc khi chay server
echo.

pause
