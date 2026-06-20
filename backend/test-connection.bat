@echo off
echo ========================================
echo  Testing Backend Connection
echo ========================================
echo.
echo Testing if backend is running...
echo.

curl -X GET http://localhost:3001/api 2>nul

if %errorlevel% neq 0 (
    echo.
    echo ❌ Backend is NOT running or not accessible
    echo.
    echo Please start backend first:
    echo   cd backend
    echo   npm run start:dev
    echo.
) else (
    echo.
    echo ✅ Backend is running successfully!
    echo.
    echo Testing auth endpoint...
    echo.
    curl -X POST http://localhost:3001/api/auth -H "Content-Type: application/json" -d "{}"
    echo.
)

pause
