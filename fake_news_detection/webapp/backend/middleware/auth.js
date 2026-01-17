/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;
        
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized - No token provided'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'default-secret-key'
        );
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized - User not found'
            });
        }
        
        // Attach user to request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized - Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized - Token expired'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Server error during authentication'
        });
    }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        
        next();
    };
};

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (token) {
            const decoded = jwt.verify(
                token, 
                process.env.JWT_SECRET || 'default-secret-key'
            );
            req.user = await User.findById(decoded.id).select('-password');
        }
        
        next();
        
    } catch (error) {
        // Token is invalid but we don't block the request
        next();
    }
};

module.exports = { protect, authorize, optionalAuth };
