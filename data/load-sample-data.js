require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, { useMongoClient: true });
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// import all of our models - they need to be imported only once
const Store = require('../models/Store');
const StoreReview = require('../models/StoreReview');
const User = require('../models/User');
const Item = require('../models/Item');
const ItemReview = require('../models/ItemReview');



const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json', 'utf-8'));
const storeReviews = JSON.parse(fs.readFileSync(__dirname + '/storeReviews.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));
const items = JSON.parse(fs.readFileSync(__dirname + '/items.json', 'utf-8'));
const itemReviews = JSON.parse(fs.readFileSync(__dirname + '/itemReviews.json', 'utf-8'));

async function deleteData() {
    console.log('Goodbye Data...');
    await Store.remove();
    await StoreReview.remove();
    await Item.remove();
    await ItemReview.remove();
    await User.remove();
    console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
    process.exit();
}

async function loadData() {
    try {
        await Store.insertMany(stores);
        await StoreReview.insertMany(storeReviews);
        await Item.insertMany(items);
        await ItemReview.insertMany(itemReviews);
        await User.insertMany(users);
        console.log('Done!');
        process.exit();
    } catch (e) {
        console.log('\nError! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run drop\n\n\n');
        console.log(e);
        process.exit();
    }
}
if (process.argv.includes('--delete')) {
    deleteData();
} else {
    loadData();
}