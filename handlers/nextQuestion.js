const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');

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

async function skip(survey, questions) {
    try {
        const ans = await Answers.findOneAndUpdate({
            phone: survey.phone
        }, {
                complete: survey.complete,
                participant: survey.participant
            }, {
                new: true,
                upsert: true
            }).exec();
        console.log('ans: ' + ans);
    } catch (error) {
        console.log(error);

    }
}

async function reask(survey, questions) {
    console.log('reask');
    try {
        const ans = await Answers.findOneAndUpdate({
            phone: survey.phone
        }, {
                complete: survey.complete,
                participant: survey.participant
            }, {
                new: true,
                upsert: true
            }).exec();
        if (ans.complete === true) {
            return respond('You have already completed the survey. Thank you!', ans.phone);
        }
        var responseLength = ans.responses.length;
        var currentQuestion = questions[responseLength];
        return respond(currentQuestion.text, ans.phone);
    } catch (error) {
        console.log(error);
    }

}

exports.handleNextQuestion = async (surveyResponse, questions, input, err) => {
    try {
        var responseLength = surveyResponse.responses.length
        var currentQuestion = questions[responseLength];
        if (responseLength >= questions.length) {
            surveyResponse.complete = true;
            return reask(surveyResponse, questions);
        }
        // If we have no input, ask the current question again
        if (!input) return reask(surveyResponse, questions);

        if (surveyResponse.participant === false) {
            if ((responseLength === 0 && currentQuestion.status === 'Open') || (responseLength === 0 && currentQuestion.status === 'Pending')) {
                surveyResponse.participant = true;
                surveyResponse.responses.push('skip');
                return skip(surveyResponse, questions);
            }
        }
        // Otherwise use the input to answer the current question
        if (surveyResponse.participant === true && currentQuestion.status === 'Open') {
            var questionResponse = {};
            if (currentQuestion.type === 'boolean') {
                if (input.toLowerCase() === 'yes') {
                    questionResponse.answer = true;
                } else if (input.toLowerCase() === 'no') {
                    questionResponse.answer = false;
                } else {
                    return reask(surveyResponse, questions);
                }
            } else {
                questionResponse.answer = input;
            }
            surveyResponse.responses.push(questionResponse);
            const ans = await Answers.findOneAndUpdate({
                phone: surveyResponse.phone
            }, {
                    complete: surveyResponse.complete,
                    participant: surveyResponse.participant,
                    responses: surveyResponse.responses
                }, {
                    new: true,
                    upsert: true
                }).exec();
            console.log('saved new: ' + ans);
        }
        // const surveyResp = await Answers.findOneAndUpdate({'phone': surveyResponse.phone} );
        // console.log(surveyResp);
    } catch (error) {
        console.log(error);
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