var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.user);
    res.json("You sent a web token! You can see /api routes!");
});

module.exports = router;
