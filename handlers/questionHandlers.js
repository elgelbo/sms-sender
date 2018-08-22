const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');
const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const questionHandlers = require('../handlers/questionHandlers')

function respond(message, phone) {
  console.log(message, phone);

  // twilio.messages
  //   .create({
  //     to: phone,
  //     from: process.env.TWILLIO_NUM,
  //     body: message,
  //   })
  //   .then((message) => 
  //   console.log('response sent')
  // );
}

exports.handleNext = (questions, answers, phone) => {
  const question = questions[answers.responses.length];
  
  if (!answers) {
    return respond('Terribly sorry, but an error has occurred. ' +
      'Please retry your message.', phone);
  }

  if (!question) {
    return respond('Thank you for participating in the poll! No more questions.', phone);
  }

  var responseMessage = '';

  if (answers.responses.length === 0 && question.status === 'Pending') {
    responseMessage += 'Thanks for participating! The poll will start shortly.';
  } else if (answers.responses.length === 0 && question.status === 'Open') {
    responseMessage += question.text;
    types();
  } else if (answers.responses.length === 0 && question.status === 'Closed') {
    responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
  } else if (answers.responses.length >= 1 && question.status === 'Open') {
    responseMessage += question.text;
    types();
  } else if (answers.responses.length >= 1 && question.status === 'Pending') {
    responseMessage += 'Hang tight for more polling questions.';
  } else if (answers.responses.length === 1 && question.status === 'Closed') {
    // skip();
    console.log('cliz 2');
    


  } else {
    responseMessage += 'Something is not quite right...';
  }

  // handle response for completed survey
  // Add question instructions for special types
  function types() {
    if (question.type === 'boolean') {
      responseMessage += ' Type "yes" or "no".';
    }

    if (question.options === 'multi') {
      responseMessage += ' Reply w/ number: 1 = Drive / 2 = Transit / 3 = Bike / 4 = Walk / 5 = Carpool';
    }
  }
  // TODO: HANDLE OPT-IN FOR EMAIL UPDATES
  // TODO: VALIDATE EMAIL
  respond(responseMessage, phone);
};