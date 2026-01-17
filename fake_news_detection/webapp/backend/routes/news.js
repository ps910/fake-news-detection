/**
 * News Classification Routes
 * Handles classification, explanation, and history
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, query, validationResult } = require('express-validator');
const Classification = require('../models/Classification');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

// ML API base URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

/**
 * @route   POST /api/news/classify
 * @desc    Classify a news article
 * @access  Public (optional auth for saving)
 */
router.post('/classify', optionalAuth, [
    body('text')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Text must be at least 10 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { text, saveResult } = req.body;
        
        // Call ML API
        const response = await axios.post(`${ML_API_URL}/api/classify`, { text });
        
        if (!response.data.success) {
            throw new Error(response.data.error || 'Classification failed');
        }
        
        const result = {
            success: true,
            prediction: response.data.prediction,
            confidence: response.data.confidence,
            probabilities: response.data.probabilities
        };
        
        // Save to database if user is authenticated and requested
        if (req.user && saveResult !== false) {
            const classification = await Classification.create({
                user: req.user.id,
                text,
                prediction: response.data.prediction,
                confidence: response.data.confidence,
                probabilities: {
                    real: response.data.probabilities.Real,
                    fake: response.data.probabilities.Fake
                }
            });
            
            // Update user classification count
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { classificationCount: 1 }
            });
            
            result.classificationId = classification._id;
            result.saved = true;
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Classification error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'ML service unavailable. Please try again later.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Classification failed'
        });
    }
});

/**
 * @route   POST /api/news/explain
 * @desc    Classify with LIME explanation
 * @access  Private
 */
router.post('/explain', protect, [
    body('text')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Text must be at least 10 characters'),
    body('numFeatures')
        .optional()
        .isInt({ min: 5, max: 20 })
        .withMessage('numFeatures must be between 5 and 20')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { text, numFeatures = 10, saveResult } = req.body;
        
        // Call ML API for explanation
        const response = await axios.post(`${ML_API_URL}/api/explain`, {
            text,
            num_features: numFeatures
        });
        
        if (!response.data.success) {
            throw new Error(response.data.error || 'Explanation failed');
        }
        
        const result = {
            success: true,
            prediction: response.data.prediction,
            confidence: response.data.confidence,
            probabilities: response.data.probabilities,
            explanation: response.data.explanation
        };
        
        // Save to database
        if (saveResult !== false) {
            const classification = await Classification.create({
                user: req.user.id,
                text,
                prediction: response.data.prediction,
                confidence: response.data.confidence,
                probabilities: {
                    real: response.data.probabilities.Real,
                    fake: response.data.probabilities.Fake
                },
                explanation: response.data.explanation,
                hasExplanation: true
            });
            
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { classificationCount: 1 }
            });
            
            result.classificationId = classification._id;
            result.saved = true;
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Explanation error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'ML service unavailable. Please try again later.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Explanation failed'
        });
    }
});

/**
 * @route   GET /api/news/history
 * @desc    Get user's classification history
 * @access  Private
 */
router.get('/history', protect, [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('prediction').optional().isIn(['Real', 'Fake']),
    query('saved').optional().isBoolean().toBoolean()
], async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        
        // Build query
        const query = { user: req.user.id };
        
        if (req.query.prediction) {
            query.prediction = req.query.prediction;
        }
        
        if (req.query.saved !== undefined) {
            query.isSaved = req.query.saved;
        }
        
        // Get classifications
        const [classifications, total] = await Promise.all([
            Classification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Classification.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: classifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get history'
        });
    }
});

/**
 * @route   GET /api/news/history/:id
 * @desc    Get single classification details
 * @access  Private
 */
router.get('/history/:id', protect, async (req, res) => {
    try {
        const classification = await Classification.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!classification) {
            return res.status(404).json({
                success: false,
                error: 'Classification not found'
            });
        }
        
        res.json({
            success: true,
            data: classification
        });
        
    } catch (error) {
        console.error('Get classification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get classification'
        });
    }
});

/**
 * @route   PUT /api/news/history/:id/save
 * @desc    Toggle save status of a classification
 * @access  Private
 */
router.put('/history/:id/save', protect, async (req, res) => {
    try {
        const classification = await Classification.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!classification) {
            return res.status(404).json({
                success: false,
                error: 'Classification not found'
            });
        }
        
        classification.isSaved = !classification.isSaved;
        await classification.save();
        
        res.json({
            success: true,
            isSaved: classification.isSaved
        });
        
    } catch (error) {
        console.error('Save toggle error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update save status'
        });
    }
});

/**
 * @route   DELETE /api/news/history/:id
 * @desc    Delete a classification
 * @access  Private
 */
router.delete('/history/:id', protect, async (req, res) => {
    try {
        const classification = await Classification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!classification) {
            return res.status(404).json({
                success: false,
                error: 'Classification not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Classification deleted'
        });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete classification'
        });
    }
});

/**
 * @route   GET /api/news/stats
 * @desc    Get user's classification statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const stats = await Classification.getUserStats(req.user.id);
        
        res.json({
            success: true,
            stats
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
});

/**
 * @route   GET /api/news/live
 * @desc    Fetch live news from Indian news sources
 * @access  Public
 */
router.get('/live', async (req, res) => {
    try {
        const { category = 'general' } = req.query;
        
        // Indian news RSS feeds by category
        const rssFeeds = {
            general: [
                { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', icon: '📰' },
                { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', icon: '🗞️' },
                { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', icon: '📺' },
                { name: 'India Today', url: 'https://www.indiatoday.in/rss/1206578', icon: '📱' },
            ],
            technology: [
                { name: 'Times of India Tech', url: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', icon: '💻' },
                { name: 'NDTV Gadgets', url: 'https://feeds.feedburner.com/gadgets360-latest', icon: '📱' },
            ],
            politics: [
                { name: 'The Hindu Politics', url: 'https://www.thehindu.com/news/national/feeder/default.rss', icon: '🏛️' },
                { name: 'India Today Politics', url: 'https://www.indiatoday.in/rss/1206514', icon: '⚖️' },
            ],
            business: [
                { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', icon: '💼' },
                { name: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/latestnews.xml', icon: '📈' },
            ],
            sports: [
                { name: 'Times of India Sports', url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', icon: '🏏' },
                { name: 'ESPN India', url: 'https://www.espn.in/espn/rss/news', icon: '⚽' },
            ],
            health: [
                { name: 'Times of India Health', url: 'https://timesofindia.indiatimes.com/rssfeeds/3908999.cms', icon: '🏥' },
            ],
            science: [
                { name: 'Times of India Science', url: 'https://timesofindia.indiatimes.com/rssfeeds/39872952.cms', icon: '🔬' },
            ]
        };

        const feeds = rssFeeds[category] || rssFeeds.general;
        const articles = [];

        // Try to fetch from RSS feeds
        for (const feed of feeds) {
            try {
                const response = await axios.get(feed.url, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                // Parse RSS XML
                const items = parseRSS(response.data, feed.name, feed.icon);
                articles.push(...items.slice(0, 5)); // Get top 5 from each source
            } catch (feedError) {
                console.log(`Failed to fetch from ${feed.name}:`, feedError.message);
            }
        }

        // If no articles fetched, return sample data
        if (articles.length === 0) {
            return res.json({
                success: true,
                articles: getSampleNews(category),
                source: 'sample'
            });
        }

        res.json({
            success: true,
            articles: articles.slice(0, 20), // Limit to 20 articles
            source: 'live'
        });

    } catch (error) {
        console.error('Live news error:', error);
        res.json({
            success: true,
            articles: getSampleNews(req.query.category || 'general'),
            source: 'sample'
        });
    }
});

// Helper function to parse RSS XML
function parseRSS(xml, sourceName, icon) {
    const articles = [];
    
    if (!xml || typeof xml !== 'string') {
        return articles;
    }
    
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
        try {
            const item = match[1];
            
            const titleMatch = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/i.exec(item);
            const descMatch = /<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/i.exec(item);
            const linkMatch = /<link>(.*?)<\/link>|<link[^>]*href="([^"]+)"/i.exec(item);
            const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(item);
            
            const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '';
            const description = descMatch ? (descMatch[1] || descMatch[2] || '') : '';
            let link = linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '';
            const pubDate = pubDateMatch ? pubDateMatch[1] : '';
            
            // Clean the link - remove CDATA if present
            if (link) {
                link = link.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
            }
            
            if (title && title.length > 10 && link) {
                articles.push({
                    id: Date.now() + Math.random(),
                    title: cleanHTML(title),
                    preview: cleanHTML(description).substring(0, 300) + (description.length > 300 ? '...' : ''),
                    source: sourceName,
                    icon: icon,
                    url: link,
                    time: formatTimeAgo(pubDate),
                    status: 'pending'
                });
            }
        } catch (parseError) {
            console.log('Error parsing RSS item:', parseError.message);
        }
    }
    
    return articles;
}

// Clean HTML tags
function cleanHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

// Format time ago
function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
}

// Sample news for fallback
function getSampleNews(category) {
    const sampleArticles = {
        general: [
            { id: 1, title: 'PM Modi inaugurates new infrastructure projects in Delhi', source: 'Times of India', icon: '📰', time: '2 hours ago', preview: 'Prime Minister Narendra Modi inaugurated several key infrastructure projects in Delhi today, including a new metro line and highway expansion...', status: 'pending', url: 'https://timesofindia.indiatimes.com/' },
            { id: 2, title: 'ISRO successfully launches new satellite for weather monitoring', source: 'The Hindu', icon: '🗞️', time: '3 hours ago', preview: 'The Indian Space Research Organisation (ISRO) has successfully launched INSAT-3DS, a new meteorological satellite designed to improve weather forecasting...', status: 'pending', url: 'https://www.thehindu.com/' },
            { id: 3, title: 'Stock markets reach all-time high amid positive economic data', source: 'Economic Times', icon: '💼', time: '4 hours ago', preview: 'Indian stock markets touched record highs today with Sensex crossing 85,000 points for the first time, driven by strong quarterly earnings reports...', status: 'pending', url: 'https://economictimes.indiatimes.com/' },
            { id: 4, title: 'SHOCKING: Secret cure for diabetes discovered in ancient temple!', source: 'Unknown Blog', icon: '⚠️', time: '1 hour ago', preview: 'You wont believe this miracle cure that doctors are hiding from you! Ancient remedy found in Himalayan temple can cure diabetes overnight...', status: 'pending', url: null },
            { id: 5, title: 'Supreme Court delivers landmark judgment on environmental protection', source: 'NDTV', icon: '📺', time: '5 hours ago', preview: 'In a significant ruling, the Supreme Court of India has directed all states to implement stricter environmental protection measures...', status: 'pending', url: 'https://www.ndtv.com/' },
        ],
        technology: [
            { id: 6, title: 'Reliance Jio announces 5G expansion to 1000 cities', source: 'NDTV Gadgets', icon: '📱', time: '2 hours ago', preview: 'Reliance Jio has announced plans to expand its 5G network coverage to 1000 cities across India by the end of this year...', status: 'pending', url: 'https://gadgets.ndtv.com/' },
            { id: 7, title: 'Infosys reports strong quarterly results, announces hiring plans', source: 'Economic Times', icon: '💻', time: '4 hours ago', preview: 'IT giant Infosys has reported better-than-expected quarterly results and announced plans to hire 50,000 new employees...', status: 'pending', url: 'https://economictimes.indiatimes.com/tech' },
            { id: 8, title: 'URGENT: Your phone is being tracked by government! Share now!', source: 'ConspiracyTech', icon: '⚠️', time: '1 hour ago', preview: 'Leaked documents reveal that every smartphone is being monitored. They dont want you to know this secret...', status: 'pending', url: null },
        ],
        politics: [
            { id: 9, title: 'Parliament passes new education reform bill', source: 'India Today', icon: '🏛️', time: '3 hours ago', preview: 'The Lok Sabha has passed a comprehensive education reform bill aimed at improving quality of education across the country...', status: 'pending', url: 'https://www.indiatoday.in/' },
            { id: 10, title: 'Chief Ministers meet to discuss inter-state water disputes', source: 'The Hindu', icon: '⚖️', time: '5 hours ago', preview: 'Chief Ministers of five southern states met in Bengaluru today to discuss long-pending inter-state water sharing disputes...', status: 'pending', url: 'https://www.thehindu.com/' },
        ],
        business: [
            { id: 11, title: 'RBI keeps repo rate unchanged in latest monetary policy', source: 'Economic Times', icon: '💼', time: '2 hours ago', preview: 'The Reserve Bank of India has decided to keep the repo rate unchanged at 6.5% in its latest monetary policy announcement...', status: 'pending', url: 'https://economictimes.indiatimes.com/' },
            { id: 12, title: 'Tata Group acquires major stake in electric vehicle company', source: 'Moneycontrol', icon: '📈', time: '4 hours ago', preview: 'Tata Motors has announced the acquisition of a significant stake in an emerging electric vehicle startup...', status: 'pending', url: 'https://www.moneycontrol.com/' },
        ],
        sports: [
            { id: 13, title: 'India wins Test series against Australia in historic victory', source: 'ESPN India', icon: '🏏', time: '1 hour ago', preview: 'Team India has clinched the Test series against Australia with a convincing victory in the final match at Melbourne...', status: 'pending', url: 'https://www.espn.in/cricket/' },
            { id: 14, title: 'IPL 2026 auction: Record-breaking bids for top players', source: 'Times of India', icon: '🏏', time: '3 hours ago', preview: 'The IPL 2026 mega auction saw record-breaking bids with several players fetching unprecedented amounts...', status: 'pending', url: 'https://timesofindia.indiatimes.com/sports' },
        ],
        health: [
            { id: 15, title: 'AIIMS develops new treatment protocol for rare disease', source: 'Times of India', icon: '🏥', time: '4 hours ago', preview: 'Doctors at AIIMS Delhi have developed a groundbreaking treatment protocol for a rare genetic disorder...', status: 'pending', url: 'https://timesofindia.indiatimes.com/life-style/health-fitness' },
            { id: 16, title: 'MIRACLE: This simple trick cures all diseases overnight!', source: 'NaturalCures', icon: '⚠️', time: '2 hours ago', preview: 'Doctors hate this one simple trick that can cure any disease. Big pharma doesnt want you to know...', status: 'pending', url: null },
        ],
        science: [
            { id: 17, title: 'IIT researchers develop breakthrough solar technology', source: 'The Hindu', icon: '🔬', time: '3 hours ago', preview: 'Researchers at IIT Madras have developed a new solar cell technology with 40% higher efficiency than current panels...', status: 'pending', url: 'https://www.thehindu.com/sci-tech/' },
            { id: 18, title: 'DRDO successfully tests indigenous hypersonic missile', source: 'India Today', icon: '🚀', time: '5 hours ago', preview: 'The Defence Research and Development Organisation has successfully test-fired an indigenously developed hypersonic missile...', status: 'pending', url: 'https://www.indiatoday.in/science' },
        ]
    };
    
    return sampleArticles[category] || sampleArticles.general;
}

module.exports = router;
