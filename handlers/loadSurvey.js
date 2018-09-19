require('dotenv').config({
    path: 'variables.env'
});
const hardSurvey = require('../survey_eng');
var Questions = require('../models/Questions');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise; //USE ES6 PROMISES see:http://mongoosejs.com/docs/promises.html#plugging-in-your-own-promises-library

mongoose.connect(process.env.MONGODB_URI).then(
    () => {
      console.log('🔗 👌 🔗 👌 🔗 👌 🔗 👌 Mongoose connection open.')
    },
    err => {
      console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`)
    }
  );
// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array)
//   }
// }
async function go(hardcode) {
  try {
      const questions = await Questions.findOneAndUpdate({
        title: hardcode.title
      }, {
          survey: hardcode.questions
      }, {
        new: true,
        upsert: true
      }).exec();
      console.log(questions);
      mongoose.connection.close();
    } catch (e) {
      console.error(e); // 💩
      mongoose.connection.close();
    }
  }
  
  go(hardSurvey);