const mongoose = require('mongoose');

exports.inbound = (req, res, next) => {
  console.log('inbound - 1 of 4');
  next();
}