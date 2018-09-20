const mongoose = require('mongoose');

// exports.inbound = (req, res, next) => {
//   next();
// }

exports.inbound = (req, res) => {
  console.log(req.body);
}