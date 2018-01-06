const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const itemReviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author!'
    },
    item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
        required: 'You must supply an item!'
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

itemReviewSchema.pre('find', autopopulate);
itemReviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('ItemReview', itemReviewSchema);