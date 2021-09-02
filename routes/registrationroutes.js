const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    res.render('index');
})

router.get('/registration', (req, res)=>{
    res.render('registrationform');
})

router.get('/adminreg', (req, res)=>{
    res.render('adminregform');
})

module.exports = router;