/**
 * Module dependencies
 */
var mongoose = require('mongoose')
    , bcrypt = require('bcrypt')
    , jsonwebtoken = require('jsonwebtoken')
    , SALT_WORK_FACTOR = 10;

/**
 * User schema
 */
var UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    events: [ {
        title: String,
        description: String,
        location: String,
        date: Date,
        time: String
    }]
});

/**
 * Pre-save hooks
 */
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


/**
 * Methods
 */
UserSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callback(err);
        return callback(null, isMatch);
    });
};

/**
 * Statics
 */

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
            var req = user;
            // test for a matching password
            doc.comparePassword(user.password, function (err, isMatch) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                // check if the password was a match
                if (isMatch) {

                    var user = {
                        username: doc.username,
                        id: doc.id,
                        firstName: doc.firstName,
                        lastName: doc.lastName
                    };

                    // return the jwt
                    if (req.remember == "on") {
                        var token = jsonwebtoken.sign(user, 'supersecret', {
                            expiresInMinutes: 10080 // expires in 7 days
                        });
                    } else {
                        var token = jsonwebtoken.sign(user, 'supersecret', {
                            expiresInMinutes: 1440 // expires in 24 hours
                        });
                    }
                    return callback(null, token, user);
                }
                else {
                    return callback(new Error('Invalid username or password.'), null);

                }
            });
        }
    });
};


UserSchema.statics.Create = function (user, callback) {
    // find a user in Mongo with provided username
    this.findOne({'username': user.username}, function (err, doc) {
        // In case of any error return
        if (err) {
            return callback(err);
        }
        // already exists
        if (doc) {
            return callback(new Error('Username Already Exists'), null);
        } else {

            if (user.password != user.confirm) {
                return callback(new Error('Passwords do not match.'), null);
            }

            // if there is no user with that username
            // create the user
            var User =  mongoose.model('User', UserSchema);
            var newUser = new User({
                password: user.password,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            });

            // save the user
            newUser.save(function (err) {
                // In case of any error, return using the done method
                if (err) {
                    return callback(err);
                }
                // User Registration succesful
                return callback(null, newUser);
            });
        }
    });
};

UserSchema.statics.addNetworkingEvent = function (user, event, callback){
    //find the current user
    this.update({'username': user.username}, {$push: {events: event}}, function(err){
        if (err){
            console.log(err);
            next(err);
        }
        callback(null, "Done");
    })
};




/**
 * Register UserSchema
 */
module.exports = mongoose.model('User', UserSchema);