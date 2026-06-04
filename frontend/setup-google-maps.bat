@echo off
echo ========================================
echo   Google Maps API Setup
echo ========================================
echo.
echo Buoc 1: Lay API Key
echo -------------------
echo 1. Truy cap: https://console.cloud.google.com/
echo 2. Tao project moi hoac chon project co san
echo 3. Enable cac APIs:
echo    - Maps JavaScript API
echo    - Directions API
echo    - Places API
echo 4. Tao API Key tai: APIs ^& Services ^> Credentials
echo.
echo Buoc 2: Nhap API Key
echo -------------------
set /p API_KEY="Nhap Google Maps API Key cua ban: "
echo.

if "%API_KEY%"=="" (
    echo [ERROR] API Key khong duoc de trong!
    pause
    exit /b 1
)

echo Dang cap nhat .env.local...
echo.

REM Backup file cu
if exist .env.local (
    copy .env.local .env.local.backup >nul
    echo [OK] Da backup .env.local thanh .env.local.backup
)

REM Tao file .env.local moi
(
echo # Firebase Configuration
echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAQGHnSICLu-1QpOItRIYen0y5AxPbIMtc
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=monimove-6cd1d.firebaseapp.com
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=monimove-6cd1d
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=monimove-6cd1d.firebasestorage.app
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=924125576856
echo NEXT_PUBLIC_FIREBASE_APP_ID=1:924125576856:web:853fae140460e139de1aed
echo.
echo # Backend API URL
echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
echo.
echo # Google Maps API Key
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=%API_KEY%
) > .env.local

echo [OK] Da cap nhat .env.local voi Google Maps API Key
echo.
echo ========================================
echo   Hoan thanh!
echo ========================================
echo.
echo Tiep theo:
echo 1. Chay: npm run build
echo 2. Chay: npm start
echo 3. Truy cap: http://localhost:3000
echo 4. Dang nhap: admin / admin
echo 5. Vao tab Monitor de xem Google Maps
echo.
pause
