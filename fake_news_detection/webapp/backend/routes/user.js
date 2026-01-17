/**
 * User Routes
 * Handles user profile and preferences
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Classification = require('../models/Classification');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile with stats
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const stats = await Classification.getUserStats(req.user.id);
        
        res.json({
            success: true,
            user: user.toPublicJSON(),
            stats
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

/**
 * @route   GET /api/user/dashboard
 * @desc    Get dashboard data
 * @access  Private
 */
router.get('/dashboard', protect, async (req, res) => {
    try {
        // Get stats
        const stats = await Classification.getUserStats(req.user.id);
        
        // Get recent classifications
        const recentClassifications = await Classification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('textPreview prediction confidence createdAt')
            .lean();
        
        // Get classification trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const trends = await Classification.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        prediction: '$prediction'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);
        
        res.json({
            success: true,
            stats,
            recentClassifications,
            trends
        });
        
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard data'
        });
    }
});

/**
 * @route   DELETE /api/user/history
 * @desc    Clear all classification history
 * @access  Private
 */
router.delete('/history', protect, async (req, res) => {
    try {
        await Classification.deleteMany({ user: req.user.id });
        
        // Reset classification count
        await User.findByIdAndUpdate(req.user.id, {
            classificationCount: 0
        });
        
        res.json({
            success: true,
            message: 'History cleared'
        });
        
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear history'
        });
    }
});

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', protect, async (req, res) => {
    try {
        // Delete all classifications
        await Classification.deleteMany({ user: req.user.id });
        
        // Delete user
        await User.findByIdAndDelete(req.user.id);
        
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
});

/**
 * @route   GET /api/user/all
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: users.length,
            users
        });
        
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

module.exports = router;
