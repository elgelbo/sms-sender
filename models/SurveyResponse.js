var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const SurveyResponseSchema = new mongoose.Schema({
  // phone number of participant
  phone: String,
  responses: [mongoose.Schema.Types.Mixed],
  // status of the participant's current survey response
  complete: {
    type: Boolean,
    default: false
  }
});

SurveyResponseSchema.statics.advance = function(args, cb) {
  // console.log(args);
  const surveyData = args.survey;
  const phone = args.phone;
  const input = args.response;
  var surveyResponse;


  const surveys = Survey.findOne({
    phone: phone,
    complete: false
  }, function(err, doc) {
    surveyResponse = doc || new Survey({
      phone: phone
    });
    processInput();
  });

  function processInput() {
    var responseLength = surveyResponse.responses.length
    var currentQuestion = surveyData[responseLength];

    function reask() {
      cb.call(surveyResponse, null, surveyResponse, responseLength);
    }
    if (!input) return reask();
    var questionResponse = {};
    questionResponse.answer = input;
    questionResponse.question = currentQuestion;
    surveyResponse.responses.push(questionResponse);
    // If new responses length is the length of survey, mark as done
    if (surveyResponse.responses.length === surveyData.length) {
      surveyResponse.complete = true;
    }
    surveyResponse.save(function(err) {
      if (err) {
        reask();
      } else {
        cb.call(surveyResponse, err, surveyResponse, responseLength+1);
      }
    });
  }
}

var Survey = mongoose.model('Survey', SurveyResponseSchema);
module.exports = Survey;
