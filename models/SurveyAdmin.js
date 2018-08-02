// const surveyData = require('../survey_data');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Define survey response model schema
const SurveyAdminSchema = new mongoose.Schema({
  title: String,
  survey: [mongoose.Schema.Types.Mixed]
});

var Admin = mongoose.model('Admin', SurveyAdminSchema);
module.exports = Admin;
