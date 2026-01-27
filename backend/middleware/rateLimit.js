const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// Helper function to create rate limiter with standard error format
const createRateLimiter = (options) => {
    return rateLimit({
        ...options,
        handler: (req, res, next, options) => {
            res.status(options.statusCode || 429).json({
                message: options.message,
                retryAfter: options.resetTime ? Math.ceil((options.resetTime - Date.now()) / 1000) : null
            });
        },
        standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
    });
};

// General API rate limiter - increased for better UX with multiple components
const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // increased from 100 to 500 requests per 15 minutes (for multiple components)
    message: "Too many requests, please try again later.",
    statusCode: 429
});

// Strict rate limiter for sensitive operations
const strictLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per hour
    message: "Too many attempts. Please try again after an hour.",
    statusCode: 429
});

// OTP rate limiter - increased for better UX with proper Retry-After header
const otpLimiter = createRateLimiter({
    windowMs: 2 * 60 * 60 * 1000, // 2 hours (increased from 1 hour)
    max: 20, // limit each IP to 20 OTP requests per 2 hours (increased from 10)
    message: "Too many OTP requests. Please try again after 2 hours.",
    statusCode: 429,
    keyGenerator: (req) => {
        // Use IP + email/rollNum for more granular rate limiting
        // Use ipKeyGenerator for proper IPv6 address handling
        const email = req.body?.email || req.body?.rollNum || '';
        return `${ipKeyGenerator(req)}-${email}`;
    }
});

// Login rate limiter - blocks after 5 failed attempts
const loginLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login attempts per hour
    message: "Too many failed login attempts. Your account is temporarily locked for 1 hour.",
    statusCode: 429
});

module.exports = {
    generalLimiter,
    strictLimiter,
    otpLimiter,
    loginLimiter
};

