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
    }).send();
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
            if (survey.spanish === true) {
                return respond('Gracias por completar la encuesta! Si quisiera saber más de el plan, visite: www.lake-elsinore.org/atp', survey.phone);
            } else {
                return respond('Thank you for completing the survey! If you want to learn more, visit: www.lake-elsinore.org/atp', survey.phone);
            }
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
            if (answers.spanish === true) {
                responseMessage += ' Responda “sí” o “no”.';
            } else {
                responseMessage += ' Type "yes" or "no".';
            }
        }
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
    console.log('nexty besty');
    
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
            return reask(surveyResponse, questions);
        }
        // Otherwise use the input to answer the current question
        if (!surveyResponse.home) {
            surveyResponse.home = {
                type: "Point",
                coordinates: [0, 0]
            };
        }

        if (!surveyResponse.work) {
            surveyResponse.work = {
                type: "Point",
                coordinates: [0, 0]
            };
        }

        if (!surveyResponse.school) {
            surveyResponse.school = {
                type: "Point",
                coordinates: [0, 0]
            };
        }

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
                    } else if (num === 2) {
                        surveyResponse.spanish = true;
                        questionResponse.answer = num;
                    } else {
                        // don't update the survey response, return the same question
                        return reask(surveyResponse, questions);
                    }
                }
            } else if (currentQuestion.type === 'boolean') {
                if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'si' || input.toLowerCase() === 'sí') {
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
                if (responseLength === 1) {
                    surveyResponse.home = geocode.features[0];
                }
                if (responseLength === 4) {
                    surveyResponse.work = geocode.features[0];
                }
                if (responseLength === 7) {
                    surveyResponse.school = geocode.features[0];
                }
                questionResponse.answer = input;
            } else if (currentQuestion.type === 'rank5') {
                var num = Number(input);
                if (isNaN(num)) {
                    // don't update the survey response, return the same question
                    return reask(surveyResponse, questions);
                } else if (num < 1 || num > 5) {
                    return reask(surveyResponse, questions);
                } else {
                    questionResponse.answer = num;
                }
            } else if (currentQuestion.type === 'mode') {
                var num = Number(input);
                if (isNaN(num)) {
                    // don't update the survey response, return the same question
                    return reask(surveyResponse, questions);
                } else if (num < 1 || num > 9) {
                    return reask(surveyResponse, questions);
                } else {
                    questionResponse.answer = num;
                }
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
                spanish: surveyResponse.spanish,
                home: surveyResponse.home,
                work: surveyResponse.work,
                school: surveyResponse.school
            }, {
                new: true,
                upsert: true
            }).exec();
        if (ans.spanish === true && ans.responses.length === 1) {
            const questions = await Questions.findOne({
                title: 'Spanish'
            });
            r2(ans, questions.survey)
        } else {
            r2(ans, questions);
        }
    } catch (error) {
        console.log(error);
    }
};