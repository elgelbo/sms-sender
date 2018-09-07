const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const advance = require('../handlers/nextQuestion')

exports.createSurvey = async (req, res, next) => {
  const phone = req.body.From;
  const input = req.body.Body;
  const questions = req.body.questions;

  function respond(message) {
    console.log(message);
    twilio.messages
      .create({
        to: phone,
        from: process.env.TWILLIO_NUM,
        body: message,
      })
      .then((message) => console.log(message.body));
  }

  const survey = await Answers.findOne({
    phone: phone
  }).exec(function (err, survey) {
    if (!survey) {
      const survey = new Answers({
        phone: phone
      }).save(function (err, survey) {

        advance.handleNextQuestion(survey, questions, input);
        // Answers.advance({
        //   phone: phone,
        //   input: input,
        //   questions: questions
        // }, handleNextQuestion);
      })
    } else {
      // Answers.advance({
      //   phone: phone,
      //   input: input,
      //   questions: questions
      // }, handleNextQuestion);
      advance.handleNextQuestion(survey, questions, input);
    }
  });
}
//   function skip(questions) {
//     console.log('skip');
//     Answers.advance({
//       phone: phone,
//       input: 'empty',
//       questions: questions
//     }, handleNextQuestion);
//   }

//   function handleNextQuestion(err, surveyResponse, questions, questionIndex) {
//     var question = questions[surveyResponse.responses.length];
//     var responseMessage = '';
//     if (err || !surveyResponse) {
//       return respond('Terribly sorry, but an error has occurred. '
//         + 'Please retry your message.');
//     }

//     if (surveyResponse.complete === true) {
//       return respond('You have already completed the survey, thank you!');
//     }

//     else if (!question) {
//       return respond('Thank you for taking this survey. Goodbye!');
//     }

//     if (surveyResponse.responses.length === 0 && question.status === 'Pending') {
//       responseMessage += 'Thanks for participating! The poll will start shortly.';
//     } else if (surveyResponse.responses.length === 0 && question.status === 'Open') {
//       responseMessage += 'Thanks for participating! ' + question.text;
//       types();
//     } else if (surveyResponse.responses.length === 0 && question.status === 'Closed') {
//       responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
//     } else if (surveyResponse.responses.length >= 1 && question.status === 'Open') {
//       responseMessage += question.text;
//       types();
//     } else if (surveyResponse.responses.length >= 1 && question.status === 'Pending') {
//       responseMessage += 'Hang tight for more polling questions.';
//     } else if (surveyResponse.responses.length >= 1 && question.status === 'Closed') {
//       responseMessage += 'Sorry, the poll is closed right now.';
//     } else {
//       responseMessage += 'Something is not quite right...';
//     }

//     if (surveyResponse.responses.length === 4) {
//       if (surveyResponse.responses[3].answer === false) {
//         return skip(questions);
//       }
//     }
//     function types() {
//       if (question.type === 'boolean') {
//         responseMessage += ' Type "yes" or "no".';
//       }
//     }
//     respond(responseMessage);
//   };
// }