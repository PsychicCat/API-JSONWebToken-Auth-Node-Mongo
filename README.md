# API-JSONWebToken-Auth-Node-Mongo
A simple Node.js API. Users are created and stored in a local database using Mongo, and they are authenticated using JSON Web Tokens.

Inside the `package.json` file we have the following two dependencies for processing json web tokens:

``` javascript
  "express-jwt": "^3.0.1",
  "jsonwebtoken": "^5.0.5"
```

For creating and storing users, we're using the following:

``` javascript
  "bcrypt": "^0.8.5",
  "mongoose": "^4.1.4"
```

Inside of the `app.js` (server side) the following two lines protect our api routes from everything that doesn't send an authorization header with a correct token:

``` javascript
  var expressJwt = require('express-jwt');
  app.use('/api/*', expressJwt({secret: 'supersecret'}));
```

You could change these routes to be whatever you need.

Also inside of `app.js`, the following error handler deals with unauthorized errors when express-jwt doesn't find a token. Without this middleware, you'll just get 500 errors back.

``` javascript
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.send(401, 'invalid token...');
    }
});
```

We then set up mongoose with the following:

``` javascript

// Bring Mongoose into the app
var mongoose = require( 'mongoose' );

// Build the connection string
var dbURI = 'mongodb://localhost:27017/jsonwebtoken';

// Create the database connection
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

```

Our users are then created in the `models/users.js` file. This is a pretty simple Mongoose schema...

```javascript
var mongoose = require('mongoose')
    , bcrypt = require('bcrypt')
    , SALT_WORK_FACTOR = 10;
    
var UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true}
});
```

...with a pre save hook set up for password encryption using Bcrypt: 

``` javascript
UserSchema.pre('save', function (next) {
    var user = this;
    console.log('saving user!');
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the clear-text password with the hashed one
            user.password = hash;
            next();
        });
    });
});
```

Also using Bcrypt, we can compare passwords using a mongoose `method`, which will understand the context of the current user:

``` javascript
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callback(err);
        return callback(null, isMatch);
    });
};
```

Finally, we actually create the user tokens using jsonwebtoken:

``` javascript
jsonwebtoken = require('jsonwebtoken')
```

*Note that the `UserSchema.statics.Create`function is omitted, as it doesn't pertain to this walkthrough. Feel free to browse the source to see the static functions for creating users.*

Finally, inside of the `User.statics.getAuthenticated` function we have the magic, which returns the tokenized user as well as a user object for our Ajax to play with.

``` javascript
UserSchema.statics.getAuthenticated = function (user, callback) {
    console.log('getAuthenticated', user);
    this.findOne({username: user.username}, function (err, doc) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        // make sure the user exists
        else if (!doc) {
            console.log('No user found,');
            return callback(new Error('Invalid username or password.', 401), null);
        }
        else {
            // test for a matching password
            doc.comparePassword(user.password, function (err, isMatch) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                // check if the password was a match
                if (isMatch) {

                    // return the jwt
                    var token = jsonwebtoken.sign(doc, 'supersecret', {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });
                    return callback(null, token, doc);
                }
                else {
                    return callback(new Error('Invalid username or password.'), null);

                }
            });
        }
    });
};
```

Inside of our client side javascript `public/javascripts/app.js` we have mostly just Ajax calls. However, the major parts are the following.


The login ajax function finishes by saving the returned token to the localStorage: 

``` JavaScript
localStorage.setItem('userToken', data.token);
```

And then finally, we set up Ajax to always include the token, as taken from localStorage:

``` javascript
function setupAjax() {
    $.ajaxSetup({
        'beforeSend': function (xhr) {
            if (localStorage.getItem('userToken')) {
                xhr.setRequestHeader('Authorization',
                    'Bearer ' + localStorage.getItem('userToken'));
            }
        }
    });
}
```

We also call `setupAjax` on page load, just in case there is a previous token saved.

That's it! Once a user logs in, they can click the `test` button to prove that their restricted API is indeed pulling information in through an Ajax call. 


