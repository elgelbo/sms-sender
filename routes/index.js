const express = require('express');
const router = express.Router();
const pageControl = require('../controllers/pageControl');
const dashControl = require('../controllers/dashControl');
const sendControl = require('../controllers/sendControl');
const resultsControl = require('../controllers/resultsControl');

const { catchErrors } = require('../handlers/errorHandlers')

// GLOBAL
router.get('/',  pageControl.homePage);

// DASHCONTROL
router.get('/dashboard', catchErrors(dashControl.getQuestions), dashControl.dashboard);
router.post('/dashboard', catchErrors(dashControl.updateAdmin), dashControl.updateDash);
router.post('/question0', catchErrors(dashControl.updateAdmin), catchErrors(resultsControl.allResults), resultsControl.extractPhNum, dashControl.updateDash);
router.post('/question1', catchErrors(dashControl.updateAdmin), dashControl.updateDash);


// SENDCONTROL
router.get('/send', sendControl.sendSMS);
router.post('/send', sendControl.standardPh, sendControl.validateSMS, sendControl.catchValidationErrs, catchErrors(sendControl.createSMS));



module.exports = router;
