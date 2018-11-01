exports.homePage = (req, res) => {
  var phoneNumber = process.env.TWILLIO_NUM.split("");
  var prettyNum = `(${phoneNumber[2]}${phoneNumber[3]}${phoneNumber[4]}) ${phoneNumber[5]}${phoneNumber[6]}${phoneNumber[7]}-${phoneNumber[8]}${phoneNumber[9]}${phoneNumber[10]}${phoneNumber[11]}`;
  res.render('index', {
    title: 'Home',
    phone: prettyNum
  });
}


exports.resultsPage = (req, res) => {
  res.render('results', {
    title: 'Survey Results',
    results: req.body
  });
}
