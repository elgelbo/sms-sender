const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');

exports.getQuestions = async (req, res, next) => {
  const questions = await Admin.findOne({
    title: 'Survey Admin'
  });
  req.body.questions = questions.survey;
  next();
};

exports.dashboard = (req, res) => {
  res.render('dash', {
    title: 'Survey Dashboard',
    survey: req.body.questions
  });
}

// POST DASHBOARD
exports.updateAdmin = async (req, res, next) => {
  req.body.title = 'Survey Admin';
  const admin = await Admin.findOneAndUpdate({
    title: req.body.title
  }, req.body, {
    new: true
  }).exec();
  next();
};

exports.updateDash = (req, res) => {
  req.flash('success', `Successfully updated survey.`);
  res.redirect('dashboard');
};
