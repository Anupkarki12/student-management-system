@echo off
chcp 65001 >nul
echo ============================================
echo   Starting School Management System
echo ============================================
echo.

REM Check if MongoDB is running
echo [INFO] Checking MongoDB status...
net start | findstr /i "MongoDB" >nul
if %errorLevel% equ 0 (
    echo [INFO] MongoDB is already running.
) else (
    echo [INFO] MongoDB is not running. Starting it now...
    echo.
    echo Please run 'mongodb-start.bat' as Administrator first if MongoDB is not installed!
    echo.
    echo For now, attempting to start MongoDB service...
    net start MongoDB
    if %errorLevel% neq 0 (
        echo [ERROR] Could not start MongoDB. Please run mongodb-start.bat as Administrator.
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo [INFO] MongoDB started successfully!
)

echo.
echo [INFO] Waiting for MongoDB to be ready (3 seconds)...
timeout /t 3 /nobreak >nul

REM Start the backend server
echo.
echo [INFO] Starting backend server...
echo.
echo ============================================
echo   Backend is starting at http://localhost:5000
echo   API Health: http://localhost:5000/health
echo ============================================
echo.

cd /d "%~dp0"

REM Check if npm is available
npm --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] npm not found! Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [INFO] Starting npm server...
echo.

npm start

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] npm start failed!
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

