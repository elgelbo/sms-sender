const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const questionHandlers = require('../handlers/questionHandlers')

exports.createSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const input = req.body.Body;
  const surveyQuestions = req.body.questions;
  const surveyResponse = req.body.survey;
  
  Answers.advance({
    phone: phone,
    input: input,
    surveyQuestions: surveyQuestions,
    surveyResponse: surveyResponse
  }, questionHandlers.handleNext);
  // TODO SEND REQ.BODY WITH MESSAGE AND PHONE FOR SEND OR DO IN HANDLE NEXT FN
  next();
}