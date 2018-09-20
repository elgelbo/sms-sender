const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const advance = require('../handlers/nextQuestion')

exports.getSurvey = async (req, res, next) => {
  console.log('getting survey - 2/4');
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
    return next();
  })
  .catch(function (err) {
    console.log(err);
  });
}

exports.advanceSurvey = async (req, res) => {
  console.log('advanced - 4/4');
  
  const input = req.body.Body;
  const questions = req.body.questions;
  const survey = req.body.survey
  await advance.handleNextQuestion(survey, questions, input);
  res.status(200).end();
}