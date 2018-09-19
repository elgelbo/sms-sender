const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const advance = require('../handlers/nextQuestion')

exports.createSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const input = req.body.Body;
  const questions = req.body.questions;
  const survey = await Answers.findOne({
    phone: phone
  }).exec(function (err, survey) {
    if (!survey) {
      const survey = new Answers({
        phone: phone
      }).save(function (err, survey) {
        advance.handleNextQuestion(survey, questions, input);
      })
    } else {
      advance.handleNextQuestion(survey, questions, input);
    }
  });
}

exports.getSurvey = async (req, res, next) => {
  const phone = '+16198613777';
  const survey = await Answers.findOne({
    phone: phone
  }).exec(function (err, survey) {
    if (!survey) {
      const survey = new Answers({
        phone: phone
      }).save()
    }
  });
  req.body.survey = survey;
  next();
}

exports.showData = async (req, res) => {
  res.json(req.body);
}

exports.advanceSurvey = async (req, res) => {
  const input = req.body.Body;
  const questions = req.body.questions;
  const survey = req.body.survey
  await advance.handleNextQuestion(survey, questions, input);
  res.status(200).end();
}