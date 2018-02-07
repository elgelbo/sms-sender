const express = require('express');
const router = express.Router();
const storeControl = require('../controllers/storeControl');
// const mapControl = require('../controllers/mapControl');

const { catchErrors } = require('../handlers/errorHandlers')

// GLOBAL
router.get('/',  storeControl.homePage);

// CREATE
// router.get('/store', storeControl.newStore);
router.get('/store2', storeControl.newStore2);
// router.post('/store', storeControl.upS3, storeControl.saveUpload, catchErrors(storeControl.createStore));
router.post('/store2', storeControl.validateSender, catchErrors(storeControl.createSms));
router.post('/sms', catchErrors(storeControl.createSurvey), storeControl.sms);
module.exports = router;
