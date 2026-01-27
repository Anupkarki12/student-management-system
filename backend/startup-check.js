// Startup diagnostic script - Run this to check for common issues
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('========== STARTUP DIAGNOSTICS ==========\n');

// 1. Check Node.js version
console.log(`✅ Node.js version: ${process.version}`);

// 2. Check environment variables
console.log('\n📋 Environment Variables Check:');
const requiredEnvVars = ['MONGO_URL'];
let allEnvVarsPresent = true;

requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
        console.log(`  ✓ ${envVar}: ${envVar === 'MONGO_URL' ? '***SET***' : value}`);
    } else {
        console.log(`  ❌ ${envVar}: NOT SET`);
        allEnvVarsPresent = false;
    }
});

if (!allEnvVarsPresent) {
    console.log('\n⚠️  WARNING: Some environment variables are missing!');
    console.log('   Please create or update your .env file with the required values.');
}

// 3. Check directories
console.log('\n📁 Directory Check:');
const dirs = ['uploads', 'uploads/profile-photos', 'uploads/notes'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✓ ${dir}: EXISTS`);
    } else {
        console.log(`  ⚠️  ${dir}: MISSING (will be created)`);
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// 4. Check MongoDB connection
console.log('\n🔌 MongoDB Connection Check:');
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
    console.log('  ❌ MONGO_URL not set - cannot test connection');
} else {
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('  ✓ MongoDB connection: SUCCESS');
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log('  ❌ MongoDB connection: FAILED');
        console.log(`     Error: ${err.message}`);
        console.log('\n     Possible solutions:');
        console.log('     1. Check if MongoDB is running');
        console.log('     2. Verify your MONGO_URL in .env file');
        console.log('     3. Check network connectivity');
    });
}

console.log('\n========== DIAGNOSTICS COMPLETE ==========\n');

