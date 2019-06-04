require('dotenv').config({
  path: 'variables.env'
});
const espSurvey = require('../survey_esp');
const engSurvey = require('../survey_eng');
const hardSurvey = [espSurvey, engSurvey];
var Questions = require('../models/Questions');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise; //USE ES6 PROMISES see:http://mongoosejs.com/docs/promises.html#plugging-in-your-own-promises-library

// DB CONNECTION
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true,}).then(
  () => { console.log('🔗 👌 🔗 👌 🔗 👌 🔗 👌 Mongoose connection open.') },
  err => { console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`) }
);
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
async function go(hardcode) {
  try {
    await asyncForEach(hardcode, async (survey) => {
      await console.log(survey.title);
      const questions = await Questions.findOneAndUpdate({
        title: survey.title
      }, {
          survey: survey.questions
        }, {
          new: true,
          upsert: true
        }).exec();
      console.log(questions);
    });
    mongoose.connection.close();
  } catch (e) {
    console.error(e); // 💩
    mongoose.connection.close();
  }
}

go(hardSurvey);