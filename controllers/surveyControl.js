const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);


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
      .then((message) => console.log(message));
  }

  Answers.findOne({
    phone: phone
  }, function (err, doc) {
    if (!doc) {
      var newSurvey = new Answers({
        phone: phone
      });
      newSurvey.save(function (err, doc) {
        // Skip the input and just ask the first question
        handleNextQuestion(err, doc, questions, 0);
      });
    } else {
      // After the first message, start processing input
      Answers.advance({
        phone: phone,
        input: input,
        questions: questions
      }, handleNextQuestion);
    }
    function skip(surveyResponse, questions) {
      console.log('skip');
      
      Answers.advance({
        phone: phone,
        input: 'empty',
        questions: questions
      }, handleNextQuestion);
    }
    function handleNextQuestion(err, surveyResponse, questions, questionIndex) {
      var question = questions[questionIndex];
      // var nextQuestion = questions[questionIndex+1];
      var responseMessage = '';    



      if (err || !surveyResponse) {
        return respond('Terribly sorry, but an error has occurred. '
          + 'Please retry your message.');
      }

      // If question is null, we're done!
      if (!question) {
        return respond('Thank you for taking this survey. Goodbye!');
      }
      if (question.status === 'Closed'){
        return skip(surveyResponse, questions);
      }
      // Add a greeting if this is the first question
      if (questionIndex === 0) {
        responseMessage += 'Thank you for taking our survey! ';
      }

      // Add question text
      responseMessage += question.text;

      // Add question instructions for special types
      if (question.type === 'boolean') {
        responseMessage += ' Type "yes" or "no".';
      }
      if (questionIndex === 4) {
        if (surveyResponse.responses[3].answer != true) {
          return skip();
        }
      }
      // reply with message
      respond(responseMessage);
    }
  });
}
