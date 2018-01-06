const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const storeReviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author!'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply a store (for store review)!'
    },
    text: {
        type: String,
        required: 'Your review must have text!'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
});

function autopopulate(next) {
    this.populate('author');
    next();
}

storeReviewSchema.pre('find', autopopulate);
storeReviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('StoreReview', storeReviewSchema);