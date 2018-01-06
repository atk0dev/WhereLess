const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter an item name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'You must supply a store'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Define our indexes
itemSchema.index({
    name: 'text',
    description: 'text'
});

itemSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next(); // skip it
        return; // stop this function from running
    }
    this.slug = slug(this.name);
    // find other items that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const itemsWithSlug = await this.constructor.find({ slug: slugRegEx });
    if (itemsWithSlug.length) {
        this.slug = `${this.slug}-${itemsWithSlug.length + 1}`;
    }
    next();
    // TODO make more resiliant so slugs are unique
});

itemSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

itemSchema.statics.getTopItems = function() {
    return this.aggregate([
        // Lookup Items and populate their reviews
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'item', as: 'reviews' } },
        // filter for only items that have 2 or more reviews
        { $match: { 'reviews.1': { $exists: true } } },
        // Add the average reviews field
        {
            $project: {
                photo: '$$ROOT.photo',
                name: '$$ROOT.name',
                reviews: '$$ROOT.reviews',
                slug: '$$ROOT.slug',
                averageRating: { $avg: '$reviews.rating' }
            }
        },
        // sort it by our new field, highest reviews first
        { $sort: { averageRating: -1 } },
        // limit to at most 10
        { $limit: 10 }
    ]);
}

// find reviews where the items _id property === reviews item property
itemSchema.virtual('reviews', {
    ref: 'ItemReview', // what model to link?
    localField: '_id', // which field on the item?
    foreignField: 'item' // which field on the review?
});

function autopopulate(next) {
    this.populate('reviews');
    next();
}

itemSchema.pre('find', autopopulate);
itemSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Item', itemSchema);