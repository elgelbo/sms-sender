const express = require('express');
const router = express.Router();
const pageControl = require('../controllers/pageControl');
const dashControl = require('../controllers/dashControl');
const sendControl = require('../controllers/sendControl');
const resultsControl = require('../controllers/resultsControl');
const inboundControl = require('../controllers/inboundControl');
const surveyControl = require('../controllers/surveyControl');

const { catchErrors } = require('../handlers/errorHandlers')

// GLOBAL
router.get('/', pageControl.homePage);

// DASHCONTROL
router.get('/dashboard',
    catchErrors(dashControl.getQuestions),
    dashControl.dashboard
);
router.post('/dashboard',
    catchErrors(dashControl.updateAdmin),
    dashControl.updateDash
);
router.post('/question0',
    catchErrors(dashControl.updateAdmin),
    catchErrors(resultsControl.allResults),
    resultsControl.extractPhNum,
    dashControl.updateDash
);
router.post('/question1',
    catchErrors(dashControl.updateAdmin),
    catchErrors(resultsControl.allResults),
    resultsControl.extractPhNum,
    dashControl.updateDash
);

router.get('/results',
    catchErrors(resultsControl.allResults),
    catchErrors(resultsControl.formatResults),
    // catchErrors(resultsControl.getResults),
    resultsControl.showResults
);

router.get('/api/results',
    catchErrors(resultsControl.allResults),
    catchErrors(resultsControl.formatResults),
    // catchErrors(resultsControl.getResults),
    resultsControl.apiResults
);
// SENDCONTROL
router.get('/send', sendControl.sendSMS);
router.post('/send',
    sendControl.standardPh,
    sendControl.validateSMS,
    sendControl.catchValidationErrs,
    catchErrors(sendControl.createSMS)
);

// INBOUND SMS
router.post('/inbound'
    , inboundControl.inbound
    , catchErrors(surveyControl.getSurvey)
    , catchErrors(dashControl.getQuestions)
    , catchErrors(surveyControl.advanceSurvey)
);


module.exports = router;
