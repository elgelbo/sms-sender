const twilio = require('twilio')(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
var MapboxClient = require('@mapbox/mapbox-sdk/services/geocoding');
var client = MapboxClient({ accessToken: process.env.MAPBOX_TOKEN });
const mongoose = require('mongoose');
const Answers = mongoose.model('Answers');

function respond(message, phone) {
    twilio.messages
        .create({
            to: phone,
            from: process.env.TWILLIO_NUM,
            body: message,
        })
        .then((message) =>
            console.log(message.body),
        );
}

async function checkAddress(input) {
    const resp = await client.forwardGeocode({
        query: input.toString(),
        countries: ['us'],
        proximity: [-117.3273, 33.6681]
    })
        .send();
    return resp.body;
}



async function skip(survey, questions) {
    var questionResponse = {};
    questionResponse.answer = 'skip';
    survey.responses.push(questionResponse);
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
        r2(ans, questions);
    } catch (error) {
        console.log(error);
    }
}

async function reask(survey, questions) {
    try {
        var responseLength = survey.responses.length;
        var currentQuestion = questions[responseLength];
        var responseMessage = '';
        console.log(survey.responses.length, questions.length);

        if (survey.responses.length === questions.length) {
            survey.complete = true;
        }
        const ans = await Answers.findOneAndUpdate({
            phone: survey.phone
        }, {
                complete: survey.complete,
                participant: survey.participant,
                responses: survey.responses,
                spanish: survey.spanish
            }, {
                new: true,
                upsert: true
            }).exec();

        if (survey.complete === true || survey.responses.length === questions.length) {
            return respond('Thank you for completing the survey! If you want to learn more, visit: www.lake-elsinore.org/atp', survey.phone);
        }
        if (survey.responses.length === 0) {
            if (questions[survey.responses.length].status === 'Open') {
                return respond('Thank you for taking the survey! ' + questions[survey.responses.length].text, survey.phone)
            }
            else {
                return respond(questions[survey.responses.length].text, survey.phone);
            }
        } else {
            r2(survey, questions)
        }
    } catch (error) {
        console.log(error);
    }

}
function r2(answers, questions) {
    var responseMessage = '';
    var currentQuestion = questions[answers.responses.length];
    if (!currentQuestion) {
        return reask(answers, questions)
    }
    if (answers.responses.length === 0) {
        responseMessage += 'Thank you for taking the survey! ';
        if (currentQuestion.status === 'Pending') {
            responseMessage += 'We will start shortly.';
        }
        if (currentQuestion.status === 'Closed') {
            responseMessage += 'Sorry, the poll is closed. Thank you for your response.';
        }
    }
    if (answers.responses.length >= 0 && currentQuestion.status === 'Open') {
        responseMessage += currentQuestion.text;
        if (currentQuestion.type === 'boolean') {
            responseMessage += ' Type "yes" or "no".';
        }
    }
    if (answers.responses.length >= 1 && currentQuestion.status === 'Pending') {
        responseMessage += 'Hang tight for more polling questions.';
    }
    if (answers.responses.length >= 1 && currentQuestion.status === 'Closed') {
        responseMessage += 'Sorry, the poll is closed right now.';
    }

    // SKIP LOGIC
    if (answers.responses.length === 4) {
        if (answers.responses[3].answer === false) {
            return skip(answers, questions);
        }
    }
    if (answers.responses.length === 5) {
        if (answers.responses[3].answer === false) {
            return skip(answers, questions);
        }
    }
    if (answers.responses.length === 7) {
        if (answers.responses[6].answer === false) {
            return skip(answers, questions);
        }
    }
    if (answers.responses.length === 8) {
        if (answers.responses[6].answer === false) {
            return skip(answers, questions);
        }
    }
    if (answers.responses.length === 15) {
        if (answers.responses[14].answer === false) {
            return skip(answers, questions);
        }
    }
    respond(responseMessage, answers.phone);
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
        if (!input) return r2(surveyResponse, questions);
        if (!currentQuestion || surveyResponse.responses.length === questions.length) {
            surveyResponse.complete = true;
            return reask(surveyResponse, questions);
        }
        // Otherwise use the input to answer the current question
        if (surveyResponse.participant === true && currentQuestion.status === 'Open') {
            var questionResponse = {};
            if (currentQuestion.type === 'lang') {
                // Try and cast to a Number
                var num = Number(input);
                if (isNaN(num)) {
                    // don't update the survey response, return the same question
                    return reask(surveyResponse, questions);
                } else {
                    if (num === 1) {
                        surveyResponse.spanish = false;
                        questionResponse.answer = num;
                    } else if(num === 2) {
                        surveyResponse.spanish = true;
                        questionResponse.answer = num;
                    } else {
                    // don't update the survey response, return the same question
                    return reask(surveyResponse, questions);
                    }
                }
            } else if (currentQuestion.type === 'boolean') {
                if (input.toLowerCase() === 'yes') {
                    questionResponse.answer = true;
                } else if (input.toLowerCase() === 'no') {
                    questionResponse.answer = false;
                } else {
                    return r2(surveyResponse, questions);
                }
            } else if (currentQuestion.type === 'number') {
                // Try and cast to a Number
                var num = Number(input);
                if (isNaN(num)) {
                    // don't update the survey response, return the same question
                    return reask(surveyResponse, questions);
                } else {
                    questionResponse.answer = num;
                }
            } else if (currentQuestion.type === 'address') {
                console.log('address');
                const geocode = await checkAddress(input)
                console.log(geocode.features[0]);
                questionResponse.answer = input;
            }
            else {
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
                responses: surveyResponse.responses,
                spanish: surveyResponse.spanish
            }, {
                new: true,
                upsert: true
            }).exec();
        r2(ans, questions);
    } catch (error) {
        console.log(error);
    }
};