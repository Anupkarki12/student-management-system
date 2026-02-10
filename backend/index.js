const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const http = require("http")
// const bodyParser = require("body-parser")
const app = express()
const Routes = require("./routes/route.js")
const { generalLimiter, otpLimiter, loginLimiter } = require("./middleware/rateLimit.js")

const PORT = process.env.PORT || 5000

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    console.error('Stack:', error.stack);
});

dotenv.config();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Create uploads directory if it doesn't exist - use absolute path
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Make upload middleware available to routes
app.set('upload', upload);

app.use(express.json({ limit: '10mb' }))

// CORS configuration - handle preflight requests properly
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        if (origin.match(/^https?:\/\/[^\/]+\.vercel\.app$/) || 
            origin.match(/^https?:\/\/[^\/]+\.netlify\.app$/)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// List all registered routes
app.get('/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json({ routes });
});

// MongoDB Connection with retry logic
const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;
    
    const tryConnect = async () => {
        console.log(`\nAttempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);
        console.log(`Connection URL: ${process.env.MONGO_URL ? 'CONFIGURED' : 'NOT SET!'}`);
        
        try {
            await mongoose.connect(process.env.MONGO_URL, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
            });
            console.log("Connected to MongoDB successfully!");
            return true;
        } catch (err) {
            console.error(`MongoDB Connection Error (attempt ${retries + 1}/${maxRetries}):`);
            console.error(`Error: ${err.message}`);
            
            if (err.message.includes('ECONNREFUSED')) {
                console.error(`Tip: Make sure MongoDB is running on port 27017`);
            }
            
            retries++;
            if (retries < maxRetries) {
                console.log(`Retrying in 5 seconds...\n`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return tryConnect();
            } else {
                console.error(`\nFailed to connect to MongoDB after ${maxRetries} attempts.`);
                return false;
            }
        }
    };
    
    return await tryConnect();
};

// Function to log all registered routes
const logRegisteredRoutes = () => {
    console.log('\n========== REGISTERED ROUTES ==========');
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods).join(', ').toUpperCase()
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods).join(', ').toUpperCase()
                    });
                }
            });
        }
    });
    routes.forEach(r => console.log(`  ${r.methods.padEnd(15)} ${r.path}`));
    console.log('=========================================\n');
};

// Mount API routes BEFORE starting the server
// This is critical - all API routes must be registered before server starts
console.log('Mounting API routes...');
app.use('/', Routes);
console.log('API routes mounted successfully');

// Start the server
const startServer = async () => {
    // Connect to MongoDB first
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
        console.log('\nWARNING: MongoDB not connected. Server will start but database operations will fail.');
    }
    
    // Start Express server
    app.listen(PORT, () => {
        console.log(`\nServer started at port no. ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Routes list: http://localhost:${PORT}/routes`);
        
        if (dbConnected) {
            console.log(`\nServer is ready to accept requests!`);
        } else {
            console.log(`\nServer is running but MongoDB is NOT connected.`);
        }
        
        // Log routes after server starts
        logRegisteredRoutes();
    });
};

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Export for testing
module.exports = { app, connectDB };

// 404 Handler - must be after API routes
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: `Route ${req.method} ${req.url} not found`,
        availableRoutes: '/routes'
    });
});

// Error handler - comprehensive logging for all errors
app.use((err, req, res, next) => {
    console.error('ROUTE ERROR:', req.method, req.url);
    console.error('Error:', err.message);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

// Serve static files from React frontend build
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch-all handler for SPA - must be LAST
// IMPORTANT: Handle WebSocket requests before this
app.use((req, res, next) => {
    const upgradeHeader = req.headers.upgrade || req.headers.Upgrade;
    if (req.url.includes('/ws') || (upgradeHeader && upgradeHeader.toLowerCase().includes('websocket'))) {
        return res.status(501).json({ message: 'WebSocket not supported' });
    }
    next();
});

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/build/index.html")
  );
});

