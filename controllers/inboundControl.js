const mongoose = require('mongoose');

// exports.inbound = (req, res, next) => {
//   next();
// }

exports.inbound = (req, res, next) => {
  console.log('mess');
  
  res.status(200).end();
}