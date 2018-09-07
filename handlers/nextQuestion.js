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
    survey.responses.push('skip');
    try {
        const ans = await Answers.findOneAndUpdate({
            phone: survey.phone
        }, {
                complete: survey.complete,
                participant: survey.participant,
                responses: survey.responses
            }, {
                new: true,
                upsert: true
            }).exec();
        respond(questions[ans.responses.length].text, ans.phone);
        // getting error b/c skip on email q is end of questions.
    } catch (error) {
        console.log(error);

    }
}

async function reask(survey, questions) {
    console.log('reask');
    try {
        var responseLength = survey.responses.length;
        var currentQuestion = questions[responseLength];
        var responseMessage = '';
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
            return respond('Thank you for completing the survey!', ans.phone);
        }
        if (ans.responses.length === 0) {
            console.log('no resp');
            if (questions[ans.responses.length].status === 'Open') {
                console.log('first q - open' + currentQuestion.text);

            } else if (questions[ans.responses.length].status === 'Pending') {
                console.log('first q -pend');

            } else {

            }
        }

        // else if (ans.responses.length === 0 && questions[ans.responses.length].status === 'Open') {
        //     responseMessage +='Thank you for taking the survey. ' + questions[ans.responses.length].text
        //     if (questions[ans.responses.length].type === 'boolean') {
        //         responseMessage += ' Type "yes" or "no".';
        //     }
        //     return respond(responseMessage, ans.phone);
        // } else if (ans.responses.length === 0 && questions[ans.responses.length].status === 'Pending') {
        //     return respond('Thank you for taking the survey. ' + 'Please wait for the survey to start.', ans.phone);
        // }
        else {
            return respond(currentQuestion.text, ans.phone);
        }
    } catch (error) {
        console.log(error);
    }

}

exports.handleNextQuestion = async (surveyResponse, questions, input, err) => {
    try {
        var responseLength = surveyResponse.responses.length
        var currentQuestion = questions[responseLength];
        var responseMessage = '';
        if (err || !surveyResponse) {
            return respond('Terribly sorry, but an error has occurred. '
                + 'Please retry your message.', surveyResponse.phone);
        }
        // If we have no input, ask the current question again
        if (!input) return reask(surveyResponse, questions);
        if (!currentQuestion) {
            surveyResponse.complete = true;
            return reask(surveyResponse, questions);
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
        }
        if (surveyResponse.participant === false) {
            if ((responseLength === 0 && currentQuestion.status === 'Open') || (responseLength === 0 && currentQuestion.status === 'Pending')) {
                surveyResponse.participant = true;
            }
        }
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
            var currentQuestion = questions[ans.responses.length];
            // if (ans.responses.length > 0 && questions.length > 0 && !currentQuestion) {
            //     surveyResponse.complete = true;
            //     return reask(surveyResponse, questions);
            // }
            if (!currentQuestion) {
                surveyResponse.complete = true;
                return reask(surveyResponse, questions);
            }
            if (ans.responses.length === 0 && currentQuestion.status === 'Open') {
                responseMessage += 'Starting survey. ';
            } if (ans.responses.length === 0 && currentQuestion.status === 'Pending') {
                responseMessage += 'The poll will start shortly.';
            } else if (ans.responses.length === 0 && currentQuestion.status === 'Closed') {
                responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
            } else if (ans.responses.length >= 0 && currentQuestion.status === 'Open') {
                responseMessage += currentQuestion.text;
                if (currentQuestion.type === 'boolean') {
                    responseMessage += ' Type "yes" or "no".';
                }
            } else if (ans.responses.length >= 1 && currentQuestion.status === 'Pending') {
                responseMessage += 'Hang tight for more polling questions.';
            } else if (ans.responses.length >= 1 && currentQuestion.status === 'Closed') {
                responseMessage += 'Sorry, the poll is closed right now.';
            } else {
                responseMessage += 'Something is not quite right...';
            }
            if (ans.responses.length === 4) {
                if (ans.responses[3].answer === false) {
                    return skip(surveyResponse, questions);
                }
            }
        respond(responseMessage, ans.phone);
    } catch (error) {
        console.log(error);
    }
};