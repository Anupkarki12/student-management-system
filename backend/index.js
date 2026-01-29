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
    console.error('❌ UNHANDLED REJECTION:', reason);
    console.error('Promise:', promise);
    // Log but don't exit - let the server continue
});

process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION:', error);
    console.error('Stack:', error.stack);
    // In production, you might want to exit, but for development we log and continue
    // process.exit(1);
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

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(express.json({ limit: '10mb' }))

// CORS configuration - handle preflight requests properly
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        // Allow common patterns for production
        if (origin.match(/^https?:\/\/[^\/]+\.vercel\.app$/) || 
            origin.match(/^https?:\/\/[^\/]+\.netlify\.app$/)) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 204 // Some legacy browsers choke on 200
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors(corsOptions));

// Apply rate limiting to all routes
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

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

// Log all registered routes on startup
console.log('\n========== REGISTERED ROUTES ==========');
const registeredRoutes = [];
app._router.stack.forEach(middleware => {
    if (middleware.route) {
        registeredRoutes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods).join(', ').toUpperCase()
        });
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach(handler => {
            if (handler.route) {
                registeredRoutes.push({
                    path: handler.route.path,
                    methods: Object.keys(handler.route.methods).join(', ').toUpperCase()
                });
            }
        });
    }
});
registeredRoutes.forEach(r => console.log(`  ${r.methods.padEnd(15)} ${r.path}`));
console.log('=========================================\n');

// Filter and log OTP routes specifically
const otpRoutes = registeredRoutes.filter(r => r.path.includes('OTP') || r.path.includes('Reset'));
if (otpRoutes.length > 0) {
    console.log('OTP Routes:');
    otpRoutes.forEach(r => console.log(`  ✓ ${r.path}`));
} else {
    console.log('WARNING: No OTP routes found!');
}
console.log('');

// 404 Handler - must be after all routes
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: `Route ${req.method} ${req.url} not found`,
        availableRoutes: '/routes'
    });
});

// Error handler - comprehensive logging for all errors
app.use((err, req, res, next) => {
    console.error('═══════════════════════════════════════════');
    console.error('ROUTE ERROR:', req.method, req.url);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Type:', err.constructor.name);
    console.error('═══════════════════════════════════════════');
    res.status(500).json({
        message: 'Internal server error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Add a wrapper for all routes to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error('ASYNC ROUTE ERROR:', req.method, req.url);
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    });
};

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
    console.log(`Routes list: http://localhost:${PORT}/routes`)
    console.log(`OTP Debug: http://localhost:${PORT}/routes/otp`)
})

