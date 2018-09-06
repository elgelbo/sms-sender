const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //USE ES6 PROMISES see:http://mongoosejs.com/docs/promises.html#plugging-in-your-own-promises-library

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// DB CONNECTION
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }).then(
  () => { console.log('🔗 👌 🔗 👌 🔗 👌 🔗 👌 Mongoose connection open.') },
  err => { console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`) }
); // see mognoose callback on connect: http://mongoosejs.com/docs/connections.html#callback

// import mongoose models
require('./models/Answers');
require('./models/Questions');

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});