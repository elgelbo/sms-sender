const mongoose = require('mongoose'),
  Survey = mongoose.Survey;
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


// ENDPOINTs
exports.sendSMS = (req, res) => {
  res.render('send', {
    title: 'Send SMS Message'
  });
}

exports.validateSMS = [
  check('to', 'Please provide a valid mobile phone number!').isMobilePhone('en-US'),
  check('message', 'Please provide a valid message.').not().isEmpty().trim()
];


exports.standardPh = (req, res, next) => {
  try {
    const phoneNumber = phoneUtil.parse(req.body.to, 'US');  
    req.body.to = phoneUtil.format(phoneNumber, PNF.E164);   
  } catch (e) {
    console.log(e);
    req.flash('error', 'Please provide a valid mobile phone number!');
    res.render('send', {
      title: 'Send SMS Message',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next(); // there were no errors!
}
exports.catchValidationErrs = (req, res, next) => {
  const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    return `${msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    const mess = errors.array();
    req.flash('error', mess.map(err => err));
    res.render('send', {
      title: 'Send SMS Message',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next(); // there were no errors!
}

exports.createSMS = async (req, res) => {
  await twilio.messages
    .create({
      to: req.body.to,
      from: process.env.TWILLIO_NUM,
      body: req.body.message,
    })
    .then((message) => {
      req.flash('success', `Message sent to ${message.to}.`);
      res.render('send', {
        title: 'Send SMS Message',
        body: req.body,
        flashes: req.flash()
      });
    });
}