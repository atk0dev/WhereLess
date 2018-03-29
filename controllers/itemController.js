const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

exports.getItems = async(req, res) => {
    const page = req.params.page || 1;
    const limit = 6;
    const skip = (page * limit) - limit;

    // 1. Query the database for a list of all items
    const itemsPromise = Item
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' });

    const countPromise = Item.count();

    const [items, count] = await Promise.all([itemsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    if (!items.length && skip) {
        req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
        res.redirect(`/items/page/${pages}`);
        return;
    }

    res.render('items', { title: 'Items', items, page, pages, count });
};

exports.getItemBySlug = async(req, res, next) => {
    const item = await Item.findOne({ slug: req.params.slug }).populate('author reviews');
    if (!item) return next();
    res.render('item', { item, title: item.name });
};

exports.getItemWithPrices = async(req, res, next) => {
    const item = await Item.findOne({ _id: req.params.id }).populate('author');
    if (!item) return next();
    res.render('item_w_prices', { item, title: item.name });
};


exports.editItem = async(req, res) => {
    // 1. Find the item given the ID
    const item = await Item.findOne({ _id: req.params.id }).populate('store');
    // 2. confirm they are the owner of the store
    confirmOwner(item, req.user);
    // 3. Render out the edit form so the user can update their store
    res.render('editItem', { title: `Edit ${item.name}`, item });
};

const confirmOwner = (item, user) => {
    if (!item.author.equals(user._id)) {
        throw Error('You must own an item in order to edit it!');
    }
};

exports.addItem = (req, res) => {
    res.render('editItem', { title: 'Add Item' });
};

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That filetype isn\'t allowed!' }, false);
        }
    }
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next) => {
    // check if there is no new file to resize
    if (!req.file) {
        next(); // skip to the next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we have written the photo to our filesystem, keep going!
    next();
};

exports.createItem = async(req, res) => {
    req.body.author = req.user._id;
    const item = await (new Item(req.body)).save();
    req.flash('success', `Successfully Created ${item.name}. Care to leave a review?`);
    res.redirect(`/item/${item.slug}`);
};

exports.updateItem = async(req, res) => {
    console.log(req.body);
    // find and update the item
    const item = await Item.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, // return the new store instead of the old one
        runValidators: true
    }).exec();
    req.flash('success', `Successfully updated <strong>${item.name}</strong>. <a href="/item/${item.slug}">View Item →</a>`);
    res.redirect(`/items/${item._id}/edit`);
    // Redriect them the item and tell them it worked
};

exports.deleteItem = async(req, res) => {
    // 1. Find the item given the ID
    const item = await Item.findOne({ _id: req.params.id });
    // 2. confirm admin rights
    confirmAdmin(req.user);
    // 3. Render out the edit form so the user can update their item
    res.render('deleteItem', { title: `Delete ${item.name}`, item });
};

exports.dropItem = async(req, res) => {
    confirmAdmin(req.user);
    const item = await Item.find({ _id: req.params.id }).remove().exec();
    req.flash('success', `Successfully deleted item.`);
    res.redirect(`/items`);
};

const confirmAdmin = (user) => {
    let isAdmin = false;
    if ((user.roles) && (user.roles.indexOf("admin") >= 0)) {
        isAdmin = true;
    }
    if (!isAdmin) {
        throw Error('You must have admin right in order to delete it!');
    }
};

/*
exports.homePage = (req, res) => {
    res.render('index');
};

exports.getStoresByTag = async(req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true, $ne: [] };

    const tagsPromise = Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);


    res.render('tag', { tags, title: 'Tags', tag, stores });
};
*/

exports.searchItems = async(req, res) => {
    const items = await Item
        .find({
            $text: {
                $search: req.query.q
            }
        }, {
            score: { $meta: 'textScore' }
        })
        .sort({
            score: { $meta: 'textScore' }
        })
        .limit(5);
    res.json(items);
};

/*
exports.mapStores = async(req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000 // 10km
            }
        }
    };

    const stores = await Store.find(q).select('slug name description location photo').limit(10);
    res.json(stores);
};
*/
/*
exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
};
*/
/*
exports.heartStore = async(req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());

    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User
        .findByIdAndUpdate(req.user._id, {
            [operator]: { hearts: req.params.id }
        }, { new: true });
    res.json(user);
};
*/
/*
exports.getHearts = async(req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts }
    });
    res.render('stores', { title: 'Hearted Stores', stores });
};
*/

/*
exports.getTopStores = async(req, res) => {
    const stores = await Store.getTopStores();
    res.render('topStores', { stores, title: '⭐ Top Stores!' });
}
*/