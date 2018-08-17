var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const SurveyAdminSchema = new mongoose.Schema({
  title: String,
  survey: [mongoose.Schema.Types.Mixed]
});

module.exports = Admin = mongoose.model('Admin', SurveyAdminSchema);