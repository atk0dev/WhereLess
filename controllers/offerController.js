const mongoose = require('mongoose');
const Offer = mongoose.model('Offer');
// const User = mongoose.model('User');
// const jimp = require('jimp');
// const uuid = require('uuid');

exports.addOffer = (req, res) => {
  res.render('editOffer', { title: 'Add Offer' });
};

exports.createOffer = async(req, res) => {
  console.log('Creating offer');
  console.log(req.body);
  req.body.author = req.user._id;
  const offer = await (new Offer(req.body)).save();
  req.flash('success', `Successfully Created offer.`);
  res.redirect(`/item/${offer.item.slug}`);
};

exports.updateOffer = async(req, res) => {
  // find and update the offer
  const offer = await Offer.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true, // return the new store instead of the old one
      runValidators: true
  }).exec();
  req.flash('success', `Successfully updated offer. <a href="/offers/${offer._id}">View Offer →</a>`);
  res.redirect(`/item/${offer.item.slug}`);
  // Redriect them the store and tell them it worked
};

