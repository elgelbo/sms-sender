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

    var surveyResponse;

    // Find current incomplete survey
    Answers.findOne({
        phone: phone
    }, function (err, doc) {
        surveyResponse = doc || new Answers({
            phone: phone
        });
        processInput();
    });

    // fill in any answer to the current question, and determine next question
    function processInput() {

        var responseLength = surveyResponse.responses.length
        var currentQuestion = questions[responseLength];
        // if there's a problem with the input, we can re-ask the same question
        function reask() {
            cb.call(surveyResponse, null, surveyResponse, questions, responseLength);
        }

        if (responseLength === questions.length) {
            surveyResponse.complete = true;
            return reask();
        }
        // If we have no input, ask the current question again
        if (!input) return reask();

        // Otherwise use the input to answer the current question
        var questionResponse = {};
        
        if (currentQuestion.status === 'Open') {
            console.log('part open q');
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
        } else if (currentQuestion.status === 'Closed') {
            questionResponse.answer = null;
        }


        // Save type from question
        surveyResponse.responses.push(questionResponse);

        // If new responses length is the length of survey, mark as done
        if (responseLength === questions.length) {
            surveyResponse.complete = true;
        }
        if ((responseLength === 0 && currentQuestion.status === 'Open') || (responseLength === 0 && currentQuestion.status === 'Pending')) {
            surveyResponse.participant = true;
        }
        // Save response
        surveyResponse.save(function (err) {
            if (err) {
                reask();
            } else {
                cb.call(surveyResponse, null, surveyResponse, questions, responseLength + 1);
            }
        });
    }
};
var Answers = mongoose.model('Answers', AnswersSchema);
module.exports = Answers;
