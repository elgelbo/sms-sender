const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const advQuestion = require('../handlers/nextQuestion')


exports.allResults = async (req, res, next) => {
  const surveys = await Answers.find();
  req.body.surveys = surveys;
  next();
}

exports.extractPhNum = (req, res, next) => {

  const questions = req.body.survey;
  const surveyAnswers = req.body.surveys;
  const recipients = [];
  surveyAnswers.forEach((survey) => {
    advQuestion.handleNextQuestion(survey, questions);
  });
  req.body.recipients = recipients;
  next();
}

exports.singleResult = async (req, res, next) => {
  const survey = await Answers.findOne({
    phone: req.body.From
  });
  if (survey === null) {
    var resp = new Answers({ phone: req.body.From });
    req.body.survey = resp;
  } else {
    'yes surv'
    req.body.survey = survey;
  }
  next();
}

exports.formatResults = async (req, res, next) => {
  const surveys = req.body.surveys;
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

  next();
}


// need to fix route to render data to template for chart
exports.showResults = (req, res) => {
  res.json(req.body);
}
