const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const mongoose = require('mongoose');
// const Answers = mongoose.model('Answers');

function respond(message, phone) {
    console.log('respond: ' + message + phone);

    // twilio.messages
    //     .create({
    //         to: phone,
    //         from: process.env.TWILLIO_NUM,
    //         body: message,
    //     })
    //     .then((message) =>
    //         console.log(message.body),
    //     );
}
function skip() {
    console.log('skip');
    // Answers.advance({
    //     phone: phone,
    //     input: 'empty',
    //     questions: questions
    // }, handleNextQuestion(survey, questions));
}

function reask() {
    console.log('reask');
    // Answers.advance({
    //     phone: phone,
    //     input: 'empty',
    //     questions: questions
    // }, handleNextQuestion(survey, questions));
}
exports.handleNextQuestion = async (surveyResponse, questions, input, err) => {
    try {
        console.log(surveyResponse, questions, input, err);
        var responseLength = surveyResponse.responses.length
        var currentQuestion = questions[responseLength];
        // if there's a problem with the input, we can re-ask the same question
        if (responseLength >= questions.length) {
            surveyResponse.complete = true;
            // console.log('comp');
            return reask();
        }
        // // If we have no input, ask the current question again
        if (!input) return reask();

        if ((responseLength === 0 && currentQuestion.status === 'Open') || (responseLength === 0 && currentQuestion.status === 'Pending')) {
            surveyResponse.participant = true;
        }
        // // Otherwise use the input to answer the current question
        if (surveyResponse.participant === true && currentQuestion.status === 'Open') {
            var questionResponse = {};
            if (currentQuestion.type === 'boolean') {
                console.log('boolean');
                
                // var isTrue = input === '1' || input.toLowerCase() === 'yes';
                // var isFalse = input === '0' || input.toLowerCase() === 'no';
                // questionResponse.answer = isTrue || isFalse;
                // if (typeof(questionResponse.answer) !== "boolean") {
                //     return reask();
                // }
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
        console.log(surveyResponse);
    } catch (error) {
        console.log('sheeeez');

    }




    // var question = questions[surveyResponse.responses.length];
    // var responseMessage = '';
    // if (err || !surveyResponse) {
    //     return respond('Terribly sorry, but an error has occurred. '
    //         + 'Please retry your message.', surveyResponse.phone);
    // }
    // if (surveyResponse.complete === true) {
    //     return respond('You have already completed the survey, thank you!', surveyResponse.phone);
    // }

    // else if (!question) {
    //     const newResponse = surveyResponse.responses.push(input)
    //     await Answers.findOneAndUpdate({phone: surveyResponse.phone}, { name: 'jason bourne' });
    //     // await Answers.save();
    //     return respond('Thank you for taking this survey. Goodbye!', surveyResponse.phone);
    // }
    // if (surveyResponse.responses.length === 0 && question.status === 'Pending') {
    //     responseMessage += 'Thanks for participating! The poll will start shortly.';
    // } else if (surveyResponse.responses.length === 0 && question.status === 'Closed') {
    //     responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
    // } else if (surveyResponse.responses.length >= 0 && question.status === 'Open') {
    //     responseMessage += question.text;
    //     types();
    // } else if (surveyResponse.responses.length >= 1 && question.status === 'Pending') {
    //     responseMessage += 'Hang tight for more polling questions.';
    // } else if (surveyResponse.responses.length >= 1 && question.status === 'Closed') {
    //     responseMessage += 'Sorry, the poll is closed right now.';
    // } else {
    //     responseMessage += 'Something is not quite right...';
    // }

    // if (surveyResponse.responses.length === 4) {
    //     if (surveyResponse.responses[3].answer === false) {
    //         return skip(questions);
    //     }
    // }
    // function types() {
    //     if (question.type === 'boolean') {
    //         responseMessage += ' Type "yes" or "no".';
    //     }
    // }
    // respond(responseMessage, surveyResponse.phone);
    // } 
};