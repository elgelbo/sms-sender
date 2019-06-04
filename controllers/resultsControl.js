const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const advQuestion = require('../handlers/nextQuestion')
const summary = require('../handlers/summary')


exports.allResults = async (req, res, next) => {
  const surveysPromise = Answers.find();
  const [surveys] = await Promise.all([surveysPromise]);
  req.body.count = surveys.length;
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


exports.jsonResults = async (req, res) => {
  res.json(req.body);
}

exports.jsonSummary = async (req, res) => {
  const surveys = req.body.surveys;
  const clean = summary.pipeline(surveys);
  res.json(clean)
}
