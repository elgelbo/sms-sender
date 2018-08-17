const mongoose = require('mongoose');
const Survey = mongoose.model('Survey');
const advQuestion = require('../handlers/questionHandlers')


exports.allResults = async (req, res, next) => {
  const surveysPromise = Survey.find();
  const [surveys] = await Promise.all([surveysPromise]);
  req.body.surveys = surveys;  
  next();
}

exports.singleResult = async (req, res, next) => {
  const response = await Survey.findOne({
    phone: req.body.From,
    complete: false
  });
  req.body.surveyResponse = response.responses;
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
  const survey = await Survey.findOne({
    phone: req.body.From,
    complete: false
  });
  req.body.survey = survey;
  next();
}