@echo off
echo ========================================
echo   Test Google Maps API Key
echo ========================================
echo.

REM Read API key from .env.local
for /f "tokens=2 delims==" %%a in ('findstr "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" .env.local') do set API_KEY=%%a

echo API Key: %API_KEY%
echo.
echo Testing Google Maps JavaScript API...
echo.

REM Test API key with curl
curl "https://maps.googleapis.com/maps/api/js?key=%API_KEY%&callback=initMap" -o nul -s -w "HTTP Status: %%{http_code}\n"

echo.
echo ========================================
echo.
echo Nếu HTTP Status = 200, API key hoạt động tốt!
echo Nếu HTTP Status = 400, có lỗi với API key
echo.
echo Kiểm tra thêm tại:
echo https://console.cloud.google.com/google/maps-apis/api-list
echo.
echo Đảm bảo đã enable:
echo - Maps JavaScript API
echo - Directions API  
echo - Places API
echo - Geocoding API
echo.
pause
