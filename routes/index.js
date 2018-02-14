const express = require('express');
const router = express.Router();
const surveyControl = require('../controllers/surveyControl');
// const mapControl = require('../controllers/mapControl');

const { catchErrors } = require('../handlers/errorHandlers')

// GLOBAL
router.get('/',  surveyControl.homePage);

// CREATE
// router.get('/store', surveyControl.newStore);
router.get('/admin', catchErrors(surveyControl.getAdmin), surveyControl.dashboard);
router.get('/sender', surveyControl.sender);
// router.post('/store', storeControl.upS3, storeControl.saveUpload, catchErrors(storeControl.createStore));
router.post('/admin', catchErrors(surveyControl.admin));

router.post('/question0', catchErrors(surveyControl.questions));
router.post('/question1', catchErrors(surveyControl.questions));

router.post('/sender', surveyControl.validateSender, catchErrors(surveyControl.createSms));
router.post('/sms', catchErrors(surveyControl.createSurvey), surveyControl.sms);
module.exports = router;
