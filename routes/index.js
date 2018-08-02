const express = require('express');
const router = express.Router();
const surveyControl = require('../controllers/surveyControl');
const adminControl = require('../controllers/adminControl');

const { catchErrors } = require('../handlers/errorHandlers')

router.get('/', surveyControl.homePage);
router.get('/admin', catchErrors(adminControl.getAdmin), adminControl.dashboard);
router.get('/results', catchErrors(adminControl.getAdmin), catchErrors(surveyControl.allResponses), surveyControl.getResults, surveyControl.showResults);
router.get('/sender', surveyControl.sender);
router.post('/admin', catchErrors(adminControl.admin), adminControl.adminUpdate);
router.post('/question0', catchErrors(surveyControl.questions));
router.post('/question1', catchErrors(surveyControl.questions));
router.post('/sender', surveyControl.validateSender, catchErrors(surveyControl.createSms));
router.post('/sms', catchErrors(adminControl.getAdmin), catchErrors(surveyControl.createSurvey), surveyControl.sms);
module.exports = router;
