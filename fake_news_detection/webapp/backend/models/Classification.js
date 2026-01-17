/**
 * Classification Model
 * MongoDB schema for storing news classification history
 */

const mongoose = require('mongoose');

const ClassificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: [true, 'Text is required']
    },
    textPreview: {
        type: String
    },
    prediction: {
        type: String,
        enum: ['Real', 'Fake'],
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    probabilities: {
        real: {
            type: Number,
            required: true
        },
        fake: {
            type: Number,
            required: true
        }
    },
    explanation: [{
        word: String,
        score: Number,
        direction: {
            type: String,
            enum: ['Real', 'Fake']
        }
    }],
    hasExplanation: {
        type: Boolean,
        default: false
    },
    isSaved: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Create text preview before saving
ClassificationSchema.pre('save', function(next) {
    if (this.text) {
        this.textPreview = this.text.substring(0, 500);
        if (this.text.length > 500) {
            this.textPreview += '...';
        }
    }
    next();
});

// Index for efficient queries
ClassificationSchema.index({ user: 1, createdAt: -1 });
ClassificationSchema.index({ user: 1, prediction: 1 });
ClassificationSchema.index({ user: 1, isSaved: 1 });

// Static method to get user statistics
ClassificationSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                fakeCount: {
                    $sum: { $cond: [{ $eq: ['$prediction', 'Fake'] }, 1, 0] }
                },
                realCount: {
                    $sum: { $cond: [{ $eq: ['$prediction', 'Real'] }, 1, 0] }
                },
                avgConfidence: { $avg: '$confidence' },
                savedCount: {
                    $sum: { $cond: ['$isSaved', 1, 0] }
                }
            }
        }
    ]);
    
    return stats[0] || {
        total: 0,
        fakeCount: 0,
        realCount: 0,
        avgConfidence: 0,
        savedCount: 0
    };
};

module.exports = mongoose.model('Classification', ClassificationSchema);
