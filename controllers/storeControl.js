const mongoose = require('mongoose');
// const Store = mongoose.model('Store');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


// ENDPOINTs
exports.homePage = (req, res) => {
  res.render('stores', {
    title: 'Home',
    stores: req.stores
  });
}
exports.newStore2 = (req, res) => {
  res.render('editStore2', {
    title: 'Add2'
  });
}
exports.validateSender = (req, res, next) => {
  req.sanitizeBody('to');
  req.sanitizeBody('description');
  var phoneNumber = phoneUtil.parse(req.body.to, 'US');
  req.body.to = phoneUtil.format(phoneNumber, PNF.E164)
  req.checkBody('to', 'Please provide a valid mobile phone!').isMobilePhone('en-US');
  req.checkBody('message', 'Please provide a message!').notEmpty().trim();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('editStore2', { title: 'Add2.1', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
}

exports.createSms= async (req, res) => {
  // Parse number with country code.
  twilio.messages
  .create({
    to: req.body.to,
    from: process.env.TWILLIO_NUM,
    body: req.body.message,
  })
  .then((message) => console.log(message));
}
