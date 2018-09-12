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

// AnswersSchema.statics.advance = function (args, cb) {
//     const phone = args.phone;
//     const input = args.input;
//     const questions = args.questions;

//     var surveyResponse;

//     const survey = Answers.findOne({
//         phone: phone
//     }, function (err, survey) {
//         surveyResponse = survey || new Answers({
//             phone: phone
//         });
//         processInput();
//     });

//     // fill in any answer to the current question, and determine next question
//     function processInput() {
//         console.log('prcss');
//         var responseLength = surveyResponse.responses.length
//         var currentQuestion = questions[responseLength];
//         // if there's a problem with the input, we can re-ask the same question
//         function reask() {
//             cb.call(surveyResponse, null, surveyResponse, questions, responseLength);
//         }
//         if (responseLength === questions.length) {
//             surveyResponse.complete = true;
//             return reask();
//         }
//         // If we have no input, ask the current question again
//         if (!input) return reask();

//         // Otherwise use the input to answer the current question
//         if (surveyResponse.participant === true && currentQuestion.status == 'Open') {
//             var questionResponse = {};
//             if (currentQuestion.type === 'boolean') {
//                 var isTrue = input === '1' || input.toLowerCase() === 'yes';
//                 questionResponse.answer = isTrue;
//             } else if (currentQuestion.type === 'number') {
//                 // Try and cast to a Number
//                 var num = Number(input);
//                 if (isNaN(num)) {
//                     return reask();
//                 } else {
//                     questionResponse.answer = num;
//                 }
//             } else if (currentQuestion.options === 'multi') {
//                 var num = Number(input);
//                 if (num < 1 || num > 5) {
//                     return reask();
//                 } else {
//                     questionResponse.answer = num;
//                 }
//             } else {
//                 questionResponse.answer = input;
//             }
//             surveyResponse.responses.push(questionResponse);
//         }
//         if ((responseLength === 0 && currentQuestion.status === 'Open') || (responseLength === 0 && currentQuestion.status === 'Pending')) {
//             surveyResponse.participant = true;
//         }
//         surveyResponse.save(function (err) {
//             if (err) {
//                 console.log(err);
//                 reask();
//             } else {
//                 cb.call(surveyResponse, null, surveyResponse, questions, responseLength);
//             }
//         });
//     }
// };
var Answers = mongoose.model('Answers', AnswersSchema);
module.exports = Answers;
