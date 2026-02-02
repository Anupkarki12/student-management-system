@echo off
chcp 65001 >nul
echo ============================================
echo   MongoDB Setup Script for School Management System
echo ============================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this script as Administrator!
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [INFO] Checking MongoDB installation...

REM Find MongoDB installation path
set "MONGODB_PATH="
for /f "tokens=*" %%a in ('where mongod 2^>nul') do (
    set "MONGODB_PATH=%%~dpa"
    set "MONGODB_EXE=%%a"
)

if not defined MONGODB_PATH (
    echo [ERROR] MongoDB not found in system PATH!
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [INFO] MongoDB found at: %MONGODB_PATH%

REM Create data and log directories
set "MONGO_DATA_DIR=%MONGODB_PATH%data\db"
set "MONGO_LOG_DIR=%MONGODB_PATH%log"

echo.
echo [INFO] Creating data directory: %MONGO_DATA_DIR%
if not exist "%MONGO_DATA_DIR%" mkdir "%MONGO_DATA_DIR%"

echo [INFO] Creating log directory: %MONGO_LOG_DIR%
if not exist "%MONGO_LOG_DIR%" mkdir "%MONGO_LOG_DIR%"

set "MONGO_LOG_FILE=%MONGO_LOG_DIR%\mongod.log"

REM Stop existing MongoDB service if running
echo.
echo [INFO] Stopping existing MongoDB service (if running)...
net stop MongoDB 2>nul
if %errorLevel% equ 0 (
    echo [INFO] Existing MongoDB service stopped.
)

REM Remove existing MongoDB service if it exists with wrong configuration
echo [INFO] Removing existing MongoDB service (if any)...
sc delete MongoDB 2>nul

REM Install MongoDB as Windows service
echo.
echo [INFO] Installing MongoDB as Windows service...
echo [INFO] Log file: %MONGO_LOG_FILE%
echo [INFO] Data directory: %MONGO_DATA_DIR%

"%MONGODB_EXE%" --install --logpath "%MONGO_LOG_FILE%" --dbpath "%MONGO_DATA_DIR%"

if %errorLevel% neq 0 (
    echo [ERROR] Failed to install MongoDB service!
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [INFO] MongoDB service installed successfully!

REM Start MongoDB service
echo.
echo [INFO] Starting MongoDB service...
net start MongoDB

if %errorLevel% equ 0 (
    echo [SUCCESS] MongoDB service started successfully!
) else (
    echo [ERROR] Failed to start MongoDB service!
    echo Check log file: %MONGO_LOG_FILE%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

REM Wait a moment for MongoDB to fully initialize
echo.
echo [INFO] Waiting for MongoDB to initialize (3 seconds)...
timeout /t 3 /nobreak >nul

REM Verify MongoDB is running
echo [INFO] Verifying MongoDB connection...
mongo --eval "db.adminCommand('ping')" 2>nul
if %errorLevel% equ 0 (
    echo [SUCCESS] MongoDB is running and responding to connections!
) else (
    echo [WARNING] Could not verify MongoDB connection. It may still be starting up.
    echo You can verify manually by running: mongo --eval "db.adminCommand('ping')"
)

echo.
echo ============================================
echo   MongoDB Setup Complete!
echo ============================================
echo.
echo MongoDB Service Status: Running
echo Data Directory: %MONGO_DATA_DIR%
echo Log File: %MONGO_LOG_FILE%
echo.
echo You can now start your backend server:
echo   cd backend
echo   npm start
echo.
echo Press any key to exit...
pause >nul

