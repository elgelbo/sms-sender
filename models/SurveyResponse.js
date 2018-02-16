// const surveyData = require('../survey_data');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const SurveyResponseSchema = new mongoose.Schema({
  phone: String,
  responses: [mongoose.Schema.Types.Mixed],
  participant: {
    type: Boolean,
    default: false
  },
  complete: {
    type: Boolean,
    default: false
  }
});

SurveyResponseSchema.statics.advance = function(args, cb) {
  const surveyData = args.survey;
  const phone = args.phone;
  const input = args.response;
  var surveyResponse;

  const survey = Survey.findOne({
    phone: phone
  }, function(err, survey) {
    surveyResponse = survey || new Survey({
      phone: phone
    });
    processInput();
  });
  function processInput() {
    const responseLength = surveyResponse.responses.length;
    const currentQuestion = surveyData[responseLength];
    // let activeQuestions = surveyData.filter( el => el.status === 'open');
    // console.log(activeQuestions.length);
    if (surveyResponse.responses.length === surveyData.length) {
      surveyResponse.complete = true;
      return reask();
    }
    function reask() {
      cb.call(surveyResponse, null, surveyResponse, responseLength);
    }
    if (!input) return reask();

    if (surveyResponse.participant === true && currentQuestion.status === 'Open') {
      questionResponse = {};
      if (currentQuestion.type === 'boolean') {
        var isTrue = input === '1' || input.toLowerCase() === 'yes';
        questionResponse.answer = isTrue;
      } else if (currentQuestion.type === 'number') {
        // Try and cast to a Number
        var num = Number(input);
        if (isNaN(num)) {
          return reask();
        } else {
          questionResponse.answer = num;
        }
      } else if (currentQuestion.options === 'multi') {
        var num = Number(input);
        if (num < 1 || num > 5) {
          return reask();
        } else {
          questionResponse.answer = num;
        }
      } else {
        questionResponse.answer = input;
      }
      surveyResponse.responses.push(questionResponse);
    }

    if ((responseLength === 0 && surveyData[0].status === 'Open') || (responseLength === 0 && surveyData[0].status === 'Pending')) {
      surveyResponse.participant = true;
    }

    surveyResponse.save(function(err) {
      if (err) {
        console.log(err);
        reask();
      } else {
        console.log('saved');
        cb.call(surveyResponse, err, surveyResponse, responseLength+1);
      }
    });
  }
}


var Survey = mongoose.model('Survey', SurveyResponseSchema);
module.exports = Survey;
