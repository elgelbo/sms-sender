const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);

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
  req.checkBody('to', 'Please provide a valid mobile phone!').isMobilePhone('en-US');
  req.checkBody('message', 'Please provide a message!').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('editStore2', { title: 'Add2.1', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
}

exports.createSms= async (req, res) => {
  res.send(req.body);
  twilio.messages
  .create({
    to: '+1'+req.body.to,
    from: '+16196498251',
    body: req.body.message,
  })
  .then((message) => console.log(message));
}
