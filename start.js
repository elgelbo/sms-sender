const mongoose = require('mongoose');

// load env files
require('dotenv').config( { path: 'variables.env'});
// DB CONNECTION
mongoose.connect(process.env.MONGO_URI, {user: process.env.DB_USER, pass: process.env.DB_PASS}); // connect to DB
mongoose.Promise = global.Promise; //USE ES6 PROMISES
// handle dbconnection errors
mongoose.connection.on('error', (err) => {
  console.error(`err message ${err.message}`);
})

// import models
// require('./models/Store');
require('./models/SurveyResponse');
require('./models/SurveyAdmin');

// START APP
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Up and running on PORT ${server.address().port}`);
});
