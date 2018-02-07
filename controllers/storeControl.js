const mongoose = require('mongoose');
const Survey = mongoose.model('Survey');
const surveyData = require('../survey_data');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
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
    res.render('editStore2', {
      title: 'Add2.1',
      body: req.body,
      flashes: req.flash()
    });
    return; // stop the fn from running
  }
  next(); // there were no errors!
}

exports.createSms = async (req, res) => {
  // Parse number with country code.
  twilio.messages
    .create({
      to: req.body.to,
      from: process.env.TWILLIO_NUM,
      body: req.body.message,
    })
    .then((message) => console.log(message));
}

exports.sms = (req, res) => {
  console.log('sms');
}

exports.createSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const response = req.body.Body;

  function respond(message) {
    var twiml = new MessagingResponse();
    twiml.message(message);
    res.type('text/xml');
    res.send(twiml.toString());
  }
  const survey = await Survey.findOne({
    phone: phone,
    complete: false
  });
  if (!survey) {
    const survey = await (new Survey({
      phone: phone,
      complete: false
    })).save(function(err, doc) {
      handleNextQuestion(err, doc, 0)
    });
  } else {
    Survey.advance({
      phone: phone,
      response: response,
      survey: surveyData
    }, handleNextQuestion);
  }

  function handleNextQuestion(err, surveyResponse, questionIndex) {
    var question = surveyData[questionIndex];
    var responseMessage = '';
    if (err || !surveyResponse) {
      return respond('Terribly sorry, but an error has occurred. ' +
        'Please retry your message.');
    }
    // If question is null, we're done!
    if (!question) {
      return respond('Thank you!');
    }

    if (question.status === 'open') {
      console.log('open q');
    }
    if (question.status === 'closed') {
      console.log('closed q');
    }
    // Add question text
    responseMessage += question.text;
    respond(responseMessage);
  }
  next();
};


// exports.createSurvey = async (req, res, next) => {
//   const phone = req.body.From;
//   const response = req.body.Body;
//   const survey = await Survey.findOneAndUpdate({phone: phone},{response: response}, {new: true});
//   console.log(`Successfully created.`);
//   next();
// };
