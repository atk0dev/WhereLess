const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const offerSchema = new mongoose.Schema({
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
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply a store!'
    },
    text: {
        type: String
    },
    price: {
        type: Number
    }
});

function autopopulate(next) {
    this.populate('author');
    this.populate('item');
    this.populate('store');
    next();
}

offerSchema.pre('find', autopopulate);
offerSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Offer', offerSchema);