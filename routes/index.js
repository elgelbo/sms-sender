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

router.get('/results',
    catchErrors(dashControl.getDash),
    catchErrors(resultsControl.allResults),
    pageControl.resultsPage
);

router.get('/api/results',
    catchErrors(resultsControl.allResults),
    resultsControl.jsonResults
);

router.get('/api/summary',
    catchErrors(resultsControl.allResults),
    catchErrors(resultsControl.jsonSummary),
);

router.post('/inbound'
    , inboundControl.inbound
    , catchErrors(surveyControl.getSurvey)
    , catchErrors(dashControl.getQuestions)
    , catchErrors(surveyControl.advanceSurvey)
);

module.exports = router;
