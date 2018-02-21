const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');

exports.getAdmin = async (req, res, next) => {
  const admin = await Admin.findOne({
    title: 'Survey Admin'
  });
  req.body.admin = admin;
  next();
};

exports.dashboard = (req, res) => {
  res.render('admin', {
    title: 'Survey Dashboard',
    survey: req.body.admin
  });
}

// POST ADMIN
exports.admin = async (req, res, next) => {
  req.body.title = 'Survey Admin';
  const admin = await Admin.findOneAndUpdate({
    title: req.body.title
  }, req.body, {
    new: true
  }).exec();
  next();
};

exports.adminUpdate = (req, res) => {
  req.flash('success', `Successfully updated survey.`);
  res.redirect('admin');
};
