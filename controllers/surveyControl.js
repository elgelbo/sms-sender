const mongoose = require('mongoose');
const Survey = mongoose.model('Survey');
const Admin = mongoose.model('Admin');
const surveyData = require('../survey_data');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


// ENDPOINTs
exports.homePage = (req, res) => {
  res.render('index', {
    title: 'Home'
  });
}

exports.results = async (req, res) => {
  const surveysPromise = Survey.find();
  const [surveys] = await Promise.all([surveysPromise]); //
  // surveys.forEach((survey) => {
  //   recipients.push(survey.phone);
  //   console.log('thingy');
  //   handleNext(survey, survey.responses.length);
  // });
  // const surveysPromise = Survey.find();
  // const [surveys] = await Promise.all([surveysPromise]); //
  const question1 = [];
  surveys.forEach((survey) => {
    question1.push(survey.responses[0].answer);
  });
  console.log(question1);
  let q1True = question1.filter(el => el === true).length;
  let q1False = question1.filter(el => el === false).length;
  console.log({Question1: {True: q1True, False: q1False} });
  console.log();

  res.render('results', {
    title: 'Results',
    results: {Question1: [{Labels: ['True', 'False']}, {Data: [q1True, q1False]}]}
  });
}

exports.sender = (req, res) => {
  res.render('sender', {
    title: 'Send SMS'
  });
}

exports.dashboard = (req, res) => {
  res.render('admin', {
    title: 'Survey Dashboard',
    survey: req.body.admin
  });
}

exports.admin = async (req, res) => {
  req.body.title = 'Survey Admin';
  const admin = await Admin.findOneAndUpdate({
    title: req.body.title
  }, req.body, {
    new: true
  }).exec();
  req.flash('success', `Successfully updated survey.`);
  res.redirect('admin');
};

exports.getAdmin = async (req, res, next) => {
  const admin = await Admin.findOne({
    title: 'Survey Admin'
  });
  req.body.admin = admin;
  next();
};

exports.questions = async (req, res) => {

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
  const [surveys] = await Promise.all([surveysPromise]); //
  const recipients = [];
  surveys.forEach((survey) => {
    recipients.push(survey.phone);
    console.log('thingy');
    handleNext(survey, survey.responses.length);
  });

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
    //
    // // TODO: HANDLE QUESTION TYPES
    // // TODO: HANDLE OPT-IN FOR EMAIL UPDATES
    // // TODO: VALIDATE EMAIL
    //
    respond(survey, responseMessage);
  };

  function respond(survey, message) {
    // console.log(survey, message);
    console.log(survey.phone);
    twilio.messages
      .create({
        to: survey.phone,
        from: process.env.TWILLIO_NUM,
        body: message,
      })
      .then((message) => console.log(message));
    // var twiml = new MessagingResponse();
    // twiml.message(message);
    // res.type('text/xml');
    // res.send(twiml.toString());
  }



  // recipients.forEach((phone) => {
  //   twilio.messages
  //     .create({
  //       to: phone,
  //       from: process.env.TWILLIO_NUM,
  //       body: question,
  //     })
  //     .then((message) => console.log(message));
  // });
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

exports.sms = (req, res) => {
  // console.log(req.body.admin.survey);
  // console.log(surveyData);
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
    // Add question instructions for special types
    function types() {
      if (question.type === 'boolean') {
        responseMessage += ' Type "yes" or "no".';
      }

      if (question.options === 'multi') {
        responseMessage += ' Reply w/ number: 1 = Drive / 2 = Transit / 3 = Bike / 4 = Walk / 5 = Carpool';
      }
    }

    // // TODO: HANDLE OPT-IN FOR EMAIL UPDATES
    // // TODO: VALIDATE EMAIL
    //
    respond(responseMessage);
  };
  next();
}
