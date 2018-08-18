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
});

AnswersSchema.statics.advance = function (args, cb) {
  const surveyData = args.surveyQuestions;
  const phone = args.phone;
  const input = args.input;
  var surveyResponse;
  const survey = Answers.findOne({
    phone: phone
  }, function(err, survey) {
    surveyResponse = survey || new Answers({
      phone: phone
    });
    processInput();
  });

  function processInput() {
    const responseLength = surveyResponse.responses.length;
    const currentQuestion = surveyData[responseLength];
    function reask() {
      cb.call(false, surveyData, surveyResponse);
    }
    if (surveyResponse.responses.length === surveyData.length) {
      surveyResponse.complete = true;
      return reask();
    }
    if (!input) return reask();

    if (surveyResponse.participant === true && currentQuestion.status === 'Open') {
      questionResponse = {};
      if (currentQuestion.type === 'boolean') {
        if (input === '1' || input.toLowerCase() === 'yes') {
          questionResponse.answer = true;

        } else if (input === '0' || input.toLowerCase() === 'no') {
          questionResponse.answer = false
        } else {
          return reask();
        }
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
        cb.call(false, surveyData, surveyResponse);  
      }
    });
  }
}

var Answers = mongoose.model('Answers', AnswersSchema);
module.exports = Answers;
