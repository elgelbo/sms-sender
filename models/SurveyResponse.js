const surveyData = require('../survey_data');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const SurveyResponseSchema = new mongoose.Schema({
  // phone number of participant
  phone: String,
  responses: [mongoose.Schema.Types.Mixed],
  participant: {
    type: Boolean,
    default: false
  },
  // status of the participant's current survey response
  complete: {
    type: Boolean,
    default: false
  }
});

SurveyResponseSchema.statics.advance = function(args, cb) {
  // console.log(args);
  // const surveyData = args.survey;
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
  //
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

    if (surveyResponse.participant === true && currentQuestion.status === 'open') {
      questionResponse = {};
      if (currentQuestion.type === 'boolean') {
        // Anything other than '1' or 'yes' is a false
        var isTrue = input === '1' || input.toLowerCase() === 'yes';
        questionResponse.answer = isTrue;
      } else if (currentQuestion.type === 'number') {
        // Try and cast to a Number
        var num = Number(input);
        if (isNaN(num)) {
          // don't update the survey response, return the same question
          return reask();
        } else {
          questionResponse.answer = num;
        }
      } else if (currentQuestion.options === 'multi') {
        var num = Number(input);
        if (num < 1 || num > 5) {
          // don't update the survey response, return the same question
          return reask();
        } else {
          questionResponse.answer = num;
        }
      } else {
        // otherwise store raw value
        questionResponse.answer = input;
      }
      surveyResponse.responses.push(questionResponse);
      // console.log(surveyResponse);
    }

    if ((responseLength === 0 && surveyData[0].status === 'open') || (responseLength === 0 && surveyData[0].status === 'pending')) {
      surveyResponse.participant = true;
    }

    surveyResponse.save(function(err) {
      if (err) {
        console.log(err);
        reask();
      } else {
        console.log('saved');
        // console.log(surveyResponse);
        cb.call(surveyResponse, err, surveyResponse, responseLength+1);
      }
    });
    // function saveResponse(questionResponse, responseLength) {
    //
  }
}


var Survey = mongoose.model('Survey', SurveyResponseSchema);
module.exports = Survey;
