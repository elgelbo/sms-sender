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
    title: 'Home',
    stores: req.stores
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
    survey: req.body
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
  req.body = admin;
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
  surveys.forEach((element) => {
    recipients.push(element.phone);
  });
  recipients.forEach((phone) => {
    twilio.messages
      .create({
        to: phone,
        from: process.env.TWILLIO_NUM,
        body: question,
      })
      .then((message) => console.log(message));
  });


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
    if (!survey) {
      const survey = new Survey({
        phone: phone
      }).save(function(err, survey) {
        Survey.advance({
          phone: phone,
          response: response,
          survey: surveyData
        }, handleNext);
      });
    } else {
      Survey.advance({
        phone: phone,
        response: response,
        survey: surveyData
      }, handleNext);
    }
  });

  handleNext = (err, survey, questionIndex) => {
    console.log('handling next');
    // console.log(survey);
    // console.log(questionIndex);
    // respond('Terribly sorry, but an error has occurred. ' +
    //     'Please retry your message.');
    const question = surveyData[survey.responses.length];
    // console.log(question);
    if (!question) {
      return respond('Thank you!');
    }
    var responseMessage = '';
    if (survey.responses.length === 0 && question.status === 'pending') {
      responseMessage += 'Thanks for participating! The poll will start shortly.';
      // handle initial response
    } else if (survey.responses.length === 0 && question.status === 'open') {
      responseMessage += surveyData[0].text;
      // handle initial response w/question: 'Would you ever try biking, walking, or transit to get to work?'
    } else if (survey.responses.length === 0 && question.status === 'closed') {
      responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
    } else if (survey.responses.length >= 1 && question.status === 'open') {
      responseMessage += question.text;
    } else if (survey.responses.length >= 1 && question.status === 'pending') {
      responseMessage += 'Hang tight for more polling questions.';
      // handle initial response
    } else if (survey.responses.length >= 1 && question.status === 'closed') {
      responseMessage += 'Sorry, the poll is closed right now.';
      // handle initial response
    }
    // else if (survey.responses.length === surveyData.length + 1) {
    //   responseMessage += 'Thanks!';
    // }
    else {
      // console.log(surveyData.length);
      // console.log(survey.responses.length);
      console.log('fallback');
      responseMessage += 'Something is not quite right...';
    }

    // // if (survey.responses.length > 0 && surveyData[0].status === 'closed') {
    // //   // console.log(surveyData.status)
    // //   responseMessage += 'Please hang tight...';
    // // }
    // // // if (err || !survey {
    // // //     return respond('Terribly sorry, but an error has occurred. ' +
    // // //       'Please retry your message.');
    // // //   }
    // // //   //   // If question is null, we're done!

    console.log(responseMessage);
    respond(responseMessage);
    // };
  };
  next();
}
