var express = require('express')
    , router = express.Router()
    , user = require('../models/user');

/**
 *  GET: register
 * */
router.get('/', function (req, res, next) {
    res.render('register');
});

/**
 * POST: register
 */
router.post('/', function (req, res, next) {
    if (req.body.firstName === undefined || !req.body.firstName.length) {
        console.log("First Name Required.");
        res.status(400).send("First Name Required.");
    } else if (req.body.lastName === undefined || !req.body.lastName.length) {
        console.log("Last Name Required.");
        res.status(400).send("Last Name Required.");
    } else if(req.body.username === undefined || !req.body.username.length){
        console.log("Username Required.");
        res.status(400).send("Username Required.");
    } else if (req.body.password === undefined || !req.body.password.length) {
        console.log("Password Required.");
        res.status(400).send("Password Required.");
    } else if (req.body.password !== req.body.confirm) {
        console.log("Password Must Match Confirmation.");
        res.status(400).send("Password Must Match Confirmation.");
    }

    else {
        user.Create(req.body, function (err, user) {

            if (err) {
                res.status(400).send(err.message);
            }
            else {
                res.json(user);
            }
        })
    }
});

module.exports = router;