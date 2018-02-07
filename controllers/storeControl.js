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
  twilio.messages
    .create({
      to: req.body.to,
      from: process.env.TWILLIO_NUM,
      body: surveyData[0].text,
    })
    .then((message) => console.log(message));
  req.flash('success', 'Message was successfully sent!');
  res.render('editStore2', {
    title: 'Add2.1',
    body: req.body,
    flashes: req.flash()
  });
}

exports.sms = (req, res) => {
  // console.log(req.body);
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
    phone: phone
  }).exec(function(err, survey) {
    handleNext(err, survey)
  });

  handleNext = async (err, survey) => {
    console.log('asdf');
    if (!survey) {
      console.log('no survey');
      const survey = await (new Survey({
        phone: phone
      })).save(function(err, survey) {
        handleNext(err, survey)
      });
    } else {
      console.log(survey);
    }
  };

  // function handleNextQuestion(err, surveyResponse, questionIndex) {
  //   var question = surveyData[questionIndex];
  //   var responseMessage = '';
  //   if (err || !surveyResponse) {
  //     return respond('Terribly sorry, but an error has occurred. ' +
  //       'Please retry your message.');
  //   }
  //   // If question is null, we're done!
  //   if (!question) {
  //     return respond('Thank you!');
  //   }
  //
  //   if (question.status === 'open') {
  //     console.log('open q');
  //   }
  //   if (question.status === 'closed') {
  //     console.log('closed q');
  //   }
  //   // Add question text
  //   responseMessage += question.text;
  //   respond(responseMessage);
  // }
  // req.body.response = responseMessage;
  next();
};
