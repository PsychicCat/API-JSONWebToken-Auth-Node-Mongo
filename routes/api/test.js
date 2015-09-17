var express = require('express');
var router = express.Router();
var User = require('../../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json("You sent a web token! You can see /api routes!");
});

router.post('/', function (req, res, next) {
    User.addNetworkingEvent(req.user, req.body, function(err){
        if (err){
            console.log(err);
            next(err);
        } else {
            res.sendStatus(200);
        }
    })
});

router.get('/events', function(req, res, next){

   User.find({'username': req.user.username}).
       select({'events': 1, '_id': 0}).
       exec(function(err, events){
           res.json(events);
       });
});

module.exports = router;
