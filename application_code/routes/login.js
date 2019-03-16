const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/login', function (req, res) {
    res.render('login', { message: "Please Login" });
});


router.post('/authenticate',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/failure' }));


module.exports = router;
