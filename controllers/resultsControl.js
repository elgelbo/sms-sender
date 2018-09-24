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
    let q1Yes = question1.filter(el => el === 1).length;
    let q1Maybe = question1.filter(el => el === 2).length;
    let q1No = question1.filter(el => el === 3).length;
    var q1Results = {
      Question1: [{
        Labels: ['Yes', 'Maybe', 'No']
      }, {
        Data: [q1Yes, q1Maybe, q1No]
      }]
    };
  } else {
    q1Results = {
      Question1: [{
        Labels: ['Yes', 'Maybe', 'No']
      }, {
        Data: [1, 1, 1]
      }]
    };
  }

  if (question2.length > 0) {
    let q2Yes = question2.filter(el => el === 1).length;
    let q2Maybe = question2.filter(el => el === 2).length;
    let q2No = question2.filter(el => el === 3).length;
    var q2Results = {
      Question2: [{
        Labels: ['Yes', 'Maybe', 'No']
      }, {
        Data: [q2Yes, q2Maybe, q2No]
      }]
    };
  } else {
    q1Results = {
      Question1: [{
        Labels: ['Yes', 'Maybe', 'No']
      }, {
        Data: [1, 1, 1]
      }]
    };
  }
  req.body.results = [q1Results, q2Results];
  next();
}


// need to fix route to render data to template for chart
exports.showResults = (req, res) => {
  const data = JSON.stringify(req.body.results[0].Question1[1].Data);
  const labels = req.body.results[0].Question1[0].Labels;
  res.render('results', {
    title: 'Results',
    data,
    labels
  });
}


exports.apiResults = (req, res) => {
  res.json(req.body);
}
