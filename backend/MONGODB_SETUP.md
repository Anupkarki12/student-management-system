# MongoDB Setup Guide for School Management System

This document explains how to set up and start MongoDB for the School Management System.

## Prerequisites

1. **MongoDB Community Server** must be installed
   - Download from: https://www.mongodb.com/try/download/community
   - During installation, choose "Complete" setup
   - Make sure to check "Install MongoD as a Service"
   - Note: This script is for MongoDB 5.0 or similar versions

2. **Node.js** must be installed
   - Download from: https://nodejs.org/

## Setup Steps

### Step 1: Run MongoDB Setup (First Time Only)

1. **Right-click** on `mongodb-start.bat`
2. Select **"Run as administrator"**
3. The script will:
   - Verify MongoDB installation
   - Create necessary directories
   - Install MongoDB as a Windows service
   - Start the MongoDB service
   - Verify the connection

### Step 2: Start the Application

You can start the application in two ways:

**Option A: Using the batch script (Recommended)**
1. Right-click on `start-app.bat`
2. Select "Run as administrator"
3. The script will:
   - Check if MongoDB is running
   - Start MongoDB if needed
   - Start the backend server

**Option B: Manual startup**
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. Open a new terminal in the backend folder
4. Run: `npm start`

## Script Descriptions

### mongodb-start.bat
This script performs the initial MongoDB setup:
- Detects MongoDB installation path
- Creates data directory (usually `C:\Program Files\MongoDB\Server\5.0\data\db`)
- Creates log directory (usually `C:\Program Files\MongoDB\Server\5.0\log`)
- Removes any existing MongoDB service
- Installs MongoDB as a Windows service with proper configuration
- Starts the MongoDB service
- Verifies the connection

### start-app.bat
This script starts the complete application:
- Checks MongoDB service status
- Starts MongoDB if not running
- Starts the backend server on port 5000

## Troubleshooting

### "Access is denied" error
Make sure you're running the script as Administrator.

### MongoDB not found
Ensure MongoDB is installed and added to the system PATH.
You can check by running: `where mongod` in Command Prompt

### Port 27017 already in use
Another instance of MongoDB might be running. Stop it with:
```cmd
net stop MongoDB
```

### Service already exists
Run `mongodb-start.bat` as Administrator - it will automatically remove and reinstall the service.

## Manual MongoDB Setup (Alternative)

If the script doesn't work, you can set up MongoDB manually:

1. Open Command Prompt as Administrator
2. Run these commands:

```cmd
# Create directories
mkdir C:\Program Files\MongoDB\Server\5.0\data\db
mkdir C:\Program Files\MongoDB\Server\5.0\log

# Install service
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --install --logpath "C:\Program Files\MongoDB\Server\5.0\log\mongod.log" --dbpath "C:\Program Files\MongoDB\Server\5.0\data\db"

# Start service
net start MongoDB
```

## Connection String

The application uses the following MongoDB connection string (configured in `.env`):
```
MONGO_URL = mongodb://127.0.0.1/school
```

## Additional Notes

- MongoDB default port: 27017
- Database name: `school`
- The backend runs on port 5000
- The frontend runs on port 3000

