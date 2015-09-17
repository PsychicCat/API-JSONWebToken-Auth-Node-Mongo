var express = require('express');
var router = express.Router();
var User = require('../../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json("You sent a web token! You can see /api routes!");
});

router.post('/', function (req, res, next) {

    User.addNetworkingEvent({'username': user.username}, {$push: {events: event}}, function(err, doc){
        if (err){
            console.log(err);
            next(err);
        }
        callback(doc);
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
