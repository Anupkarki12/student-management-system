# Node.js App Crash Fix Guide

## Common Causes of Crash

1. **MongoDB Connection Failure** (Most Common)
   - Missing or invalid MONGO_URL in .env
   - MongoDB server not running
   - Network connectivity issues

2. **Port 5000 Conflict**
   - Another process using the port
   - Previous server not properly terminated

3. **Missing Dependencies**
   - Node modules not installed
   - Version conflicts

4. **Unhandled Promise Rejections**
   - Async errors not properly caught
   - Database operations failing silently

## Quick Fixes

### Fix 1: Kill Process on Port 5000
```batch
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or simply restart your computer
```

### Fix 2: Reinstall Dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Fix 3: Check MongoDB Connection
```bash
cd backend
node startup-check.js
```

### Fix 4: Verify .env File
Create or update `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017/school_management
PORT=5000
NODE_ENV=development
```

## Enhanced Error Handling Added

The following improvements have been made to `index.js`:

1. **Global Exception Handlers**
   - `process.on('unhandledRejection')` - Catches Promise rejections
   - `process.on('uncaughtException')` - Catches synchronous exceptions

2. **Better MongoDB Error Logging**
   - More detailed connection error messages
   - Fallback behavior if MongoDB is unavailable

3. **Startup Diagnostics**
   - Environment variable validation
   - Directory creation verification
   - MongoDB connection testing

## Testing the Fix

1. Run the startup check:
```bash
cd backend
node startup-check.js
```

2. Start the server with nodemon:
```bash
npm start
```

3. Check the health endpoint:
```
http://localhost:5000/health
```

## If Problems Persist

1. Check the actual error message in the terminal (above "app crashed" message)
2. Look for:
   - `Error: connect ECONNREFUSED` → MongoDB not running
   - `Error: ENOENT` → Missing file or directory
   - `SyntaxError` → JavaScript syntax issue
   - `MongooseError` → Database connection problem

3. Check logs in `backend/logs/` (if logging is enabled)

## Contact

If issues persist, check the VSCode terminal for the specific error message and check the project's TODO files for known issues.

