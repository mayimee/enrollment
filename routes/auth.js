const express = require('express');
const router = express.Router();
const registrationcontroller = require('../controllers/auth');

router.post('/registration', registrationcontroller.registration);
router.post('/login', registrationcontroller.login);
router.get('/updateform/:email_address', registrationcontroller.updateform);
router.post('/updateuser', registrationcontroller.updateuser);
router.get('/deleteform/:email_address', registrationcontroller.deleteform);
router.post('/deleteuser', registrationcontroller.deleteuser);

module.exports = router;