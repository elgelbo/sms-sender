const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const advance = require('../handlers/nextQuestion')

exports.getSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const survey = Answers.findOne({ phone: phone}).exec();
  survey.then(function(survey){
    if (!survey) {
      const newSurvey = new Answers({ phone: phone})
      return newSurvey.save(); 
    } else {
      return survey;
    }
  })
  .then(function (newSurvey) {
    req.body.survey = newSurvey;
    console.log(req.body);
    next();
  })
  .catch(function (err) {
    console.log(err);
  });
}

exports.advanceSurvey = async (req, res) => {
  console.log('advanced');
  
  const input = req.body.Body;
  const questions = req.body.questions;
  const survey = req.body.survey
  await advance.handleNextQuestion(survey, questions, input);
  res.status(200).end();
}