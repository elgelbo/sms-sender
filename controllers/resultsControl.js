const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const advQuestion = require('../handlers/questionHandlers')


exports.allResults = async (req, res, next) => {
  const surveysPromise = Answers.find();
  const [surveys] = await Promise.all([surveysPromise]);
  req.body.surveys = surveys;
  next();
}

exports.extractPhNum = (req, res, next) => {
  const surveyQuestions = req.body.survey;
  const surveyAnswers = req.body.surveys;
  const recipients = [];
  surveyAnswers.forEach((survey) => {
    recipients.push(survey.phone);
    const phone = survey.phone;
    const nextQuestion = advQuestion.handleNext(surveyQuestions, survey, phone);
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