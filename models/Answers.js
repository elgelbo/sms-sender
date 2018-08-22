var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const AnswersSchema = new mongoose.Schema({
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
}, {
    usePushEach: true
  });

AnswersSchema.statics.advance = function (args, cb) {
  const phone = args.phone;
  const input = args.input;
  const questions = args.questions;
  // var questions = args.survey;
  // var phone = args.phone;
  // var input = args.input;
  var surveyResponse;

  // Find current incomplete survey
  Answers.findOne({
      phone: phone,
      complete: false
  }, function(err, doc) {
      surveyResponse = doc || new Answers({
          phone: phone
      });
      processInput();
  });

//   // fill in any answer to the current question, and determine next question
//   // to ask
  function processInput() {
    //   console.log(surveyResponse);
      
//       // If we have input, use it to answer the current question
      var responseLength = surveyResponse.responses.length
      var currentQuestion = questions[responseLength];
      
      // if there's a problem with the input, we can re-ask the same question
      function reask() {
          cb.call(null, surveyResponse, responseLength);
      }

      // If we have no input, ask the current question again
      if (!input) return reask();

      // Otherwise use the input to answer the current question
      var questionResponse = {};
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
      } else if (input.indexOf('http') === 0) {
          // input is a recording URL
          questionResponse.recordingUrl = input;
      } else {
          // otherwise store raw value
          questionResponse.answer = input;
      }

      // Save type from question
      questionResponse.type = currentQuestion.type;
      surveyResponse.responses.push(questionResponse);

      // If new responses length is the length of survey, mark as done
      if (surveyResponse.responses.length === questions.length) {
          surveyResponse.complete = true;
      }

      // Save response
      surveyResponse.save(function(err) {
          if (err) {
              reask();
          } else {
              cb.call(surveyResponse,null, surveyResponse,questions, responseLength+1);
            }
      });
  }
};
var Answers = mongoose.model('Answers', AnswersSchema);
module.exports = Answers;
