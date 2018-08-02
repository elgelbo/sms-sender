const mongoose = require('mongoose');
const Survey = mongoose.model('Survey');
const Admin = mongoose.model('Admin');

const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


// ENDPOINTs
exports.homePage = (req, res) => {
  var phoneNumber = process.env.TWILLIO_NUM.split("");
  var prettyNum = `(${phoneNumber[2]}${phoneNumber[3]}${phoneNumber[4]})-${phoneNumber[5]}${phoneNumber[6]}${phoneNumber[7]}-${phoneNumber[8]}${phoneNumber[9]}${phoneNumber[10]}${phoneNumber[11]}`;
  res.render('index', {
    title: 'Home',
    phone: prettyNum
  });
}

exports.sender = (req, res) => {
  res.render('sender', {
    title: 'Send SMS'
  });
}

exports.allResponses = async (req, res, next) => {
  const surveysPromise = Survey.find();
  const [surveys] = await Promise.all([surveysPromise]);
  req.body.surveys = surveys;
  next();
}


exports.getResults = (req, res, next) => {
  const surveys = req.body.surveys
  const question1 = [];
  const question2 = [];
  surveys.forEach((survey) => {
    if (survey.responses.length >= 1) {
      question1.push(survey.responses[0].answer);
    } else {
      question1.push(null)
    }
    if (survey.responses.length >= 2) {
      question2.push(survey.responses[1].answer);
    } else {
      question2.push(null)
    }
  });
  if (question1.length > 0) {
    let q1True = question1.filter(el => el === true).length;
    let q1False = question1.filter(el => el === false).length;
    var q1Results = {
      Question1: [{
        Labels: ['True', 'False']
      }, {
        Data: [q1True, q1False]
      }]
    };
  } else {
    q1Results = {
      Question1: [{
        Labels: ['True', 'False']
      }, {
        Data: [1, 1]
      }]
    };
  }

  if (question2.length > 0) {
    let q2True = question2.filter(el => el === true).length;
    let q2False = question2.filter(el => el === false).length;
    var q2Results = {
      Question2: [{
        Labels: ['True', 'False']
      }, {
        Data: [q2True, q2False]
      }]
    };
  } else {
    q2Results = {
      Question2: [{
        Labels: ['True', 'False']
      }, {
        Data: [1, 1]
      }]
    };
  }
  req.body.results = [q1Results, q2Results];
  next()
}

exports.showResults = (req, res) => {
  res.render('results', {
    title: 'Results',
    survey: req.body.admin,
    results: req.body.results
  });
}


// POST Q0 & Q1
exports.questions = async (req, res) => {


// TODO MAKE SEPERATE ROUTE ROUTE
  req.body.title = 'Survey Admin';
  const admin = await Admin.findOneAndUpdate({
    title: req.body.title
  }, {
    title: req.body.title,
    survey: req.body.survey
  }, {
    new: true
  }).exec();

  let questionNum = req.body.questionNum;
  const question = admin.survey[questionNum].text;
  const surveysPromise = Survey.find();

// TODO USE EXISTING ROUTE
  const [surveys] = await Promise.all([surveysPromise]); //
  const recipients = [];

// KEEP THIS WORK IN THIS ROUTE
  surveys.forEach((survey) => {
    recipients.push(survey.phone);
    handleNext(survey, survey.responses.length);
  });

// SHOULD BE SEPERATE ROUTE
  function handleNext(survey, questionIndex) {
    const surveyAdmin = admin.survey;
    const question = surveyAdmin[survey.responses.length];
    var responseMessage = '';
    if (!survey) {
      return respond('Terribly sorry, but an error has occurred. ' +
        'Please retry your message.');
    }
    if (!question) {
      return respond('Thank you for participating in the poll!');
    }

    if (survey.responses.length === 0 && question.status === 'Pending') {
      responseMessage += 'Thanks for participating! The poll will start shortly.';
    } else if (survey.responses.length === 0 && question.status === 'Open') {
      responseMessage += question.text;
      types();
      // TODO: need a better handler for default q text.
    } else if (survey.responses.length === 0 && question.status === 'Closed') {
      responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
    } else if (survey.responses.length >= 1 && question.status === 'Open') {
      responseMessage += question.text;
      types();
    } else if (survey.responses.length >= 1 && question.status === 'Pending') {
      responseMessage += 'Hang tight for more polling questions.';
    } else if (survey.responses.length >= 1 && question.status === 'Closed') {
      responseMessage += 'Sorry, the poll is closed right now.';
    } else {
      responseMessage += 'Something is not quite right...';
    }
    // Add question instructions for special types
    function types() {
      if (question.type === 'boolean') {
        responseMessage += ' Type "yes" or "no".';
      }

      if (question.options === 'multi') {
        responseMessage += ' Reply w/ number: 1 = Drive / 2 = Transit / 3 = Bike / 4 = Walk / 5 = Carpool';
      }
    }
    // TODO: HANDLE OPT-IN FOR EMAIL UPDATES
    // TODO: VALIDATE EMAIL
    respond(survey, responseMessage);
  };

  function respond(survey, message) {
    twilio.messages
      .create({
        to: survey.phone,
        from: process.env.TWILLIO_NUM,
        body: message,
      })
      .then((message) => console.log(message));
  }
  req.flash('success', `Successfully sent survey question!`);
  res.redirect('admin');
};


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

// should be own route
  twilio.messages
    .create({
      to: req.body.to,
      from: process.env.TWILLIO_NUM,
      body: req.body.message,
    })
    .then((message) => console.log(message));

  req.flash('success', 'Message was successfully sent!');
  res.render('sender', {
    title: 'Send SMS',
    body: req.body,
    flashes: req.flash()
  });
}

exports.createSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const response = req.body.Body;
  const surveyAdmin = req.body.admin.survey;

  function respond(message) {
    var twiml = new MessagingResponse();
    twiml.message(message);
    res.type('text/xml');
    res.send(twiml.toString());
  }

  const survey = await Survey.findOne({
    phone: phone
  }).exec(function(err, survey) {
    if (!survey) {
      const survey = new Survey({
        phone: phone
      }).save(function(err, survey) {
        Survey.advance({
          phone: phone,
          response: response,
          survey: surveyAdmin
        }, handleNext);
      });
    } else {
      Survey.advance({
        phone: phone,
        response: response,
        survey: surveyAdmin
      }, handleNext);
    }
  });

  function skip(empty) {
    Survey.advance({
      phone: phone,
      response: empty,
      survey: surveyAdmin
    }, handleNext);
  }

  handleNext = (err, survey, questionIndex) => {
    const question = surveyAdmin[survey.responses.length];
    var responseMessage = '';

    if (err || !survey) {
      return respond('Terribly sorry, but an error has occurred. ' +
        'Please retry your message.');
    }

    if (!question) {
      return respond('Thank you for participating in the poll!');
    }

    if (survey.responses.length === 0 && question.status === 'Pending') {
      responseMessage += 'Thanks for participating! The poll will start shortly.';
    } else if (survey.responses.length === 0 && question.status === 'Open') {
      responseMessage += question.text;
      types();
      // TODO: need a better handler for default q text.
    } else if (survey.responses.length === 0 && question.status === 'Closed') {
      responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
    } else if (survey.responses.length >= 1 && question.status === 'Open') {
      responseMessage += question.text;
      types();
    } else if (survey.responses.length >= 1 && question.status === 'Pending') {
      responseMessage += 'Hang tight for more polling questions.';
    } else if (survey.responses.length >= 1 && question.status === 'Closed') {
      responseMessage += 'Sorry, the poll is closed right now.';
    } else {
      responseMessage += 'Something is not quite right...';
    }

    if (questionIndex === 4) {
      if (survey.responses[3].answer === false) {
        var empty = 'none';
        return skip(empty);
      }
    }

    // Add question instructions for special types
    function types() {
      if (question.type === 'boolean') {
        responseMessage += ' Type "yes" or "no".';
      }

      if (question.options === 'multi') {
        responseMessage += ' Reply w/ number: 1 = Strongly Agree / 2 = Agree / 3 = Neutral / 4 = Disagree / 5 = Strongly Disagree';
      }
    }

    // TODO: VALIDATE EMAIL
    respond(responseMessage);
  };
  next();
}

exports.sms = (req, res) => {
  console.log('sms route, nothing happens here');
}
