/**
 * Express Server Configuration
 * Main entry point for the Node.js backend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/user');

// Initialize Express app
const app = express();

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api/', limiter);

// ===========================================
// DATABASE CONNECTION
// ===========================================

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fakenews_db');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// ===========================================
// API ROUTES
// ===========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error'
    });
});

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 Fake News Detection - Backend Server');
        console.log('='.repeat(50));
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Server running at: http://localhost:${PORT}`);
        console.log('='.repeat(50) + '\n');
    });
};

startServer();

module.exports = app;
