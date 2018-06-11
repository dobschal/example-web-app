const express = require('express');
const router  = express.Router();
const security = require("../services/security");
const User = require("../models/User");
const email = require("../services/email");

module.exports = function( io ) {

    router.post('/login', function(req, res, next) {
        const { username, password } = req.body;
        const hashedPassword = security.hashPassword( password );
        User.findOne({ username: username, password: hashedPassword }, (err, user) => {
            if (err || !user)
            {
                let deniedError = new Error("Permission denied.");
                deniedError.status = 401;
                return next( deniedError );
            }
            if( !user.valid )
            {
                let notValidError = new Error("Account not valid.");
                notValidError.status = 409;
                return next( notValidError );
            }
            const token = security.getToken( user.username, user.userRole, String(user._id) );
            res.send({ success: true, token });
        });
    });

    router.get("/user/:username", function( req, res, next) {
        const { username } = req.params;

        User.findOne({ username: username }, (err, userFromDB) => {
            if (err)
            {
                err.status = 500;
                return next( err );
            }
            if (!userFromDB)
            {
                let conflictError = new Error("User does not exist.");
                conflictError.status = 404;
                return next( conflictError );
            }
            let { username: usernameFromDB, userRole } = userFromDB;
            res.status(200).send({ usernameFromDB, userRole });
        });
    });

    router.post('/register', function(req, res, next) {
        const { username, email: emailOfUser, password } = req.body;

        User.findOne({ username: username }, (err, userFromDB) => {
            if (err)
            {
                err.status = 500;
                return next( err );
            }
            if (userFromDB)
            {
                let conflictError = new Error("User already exists.");
                conflictError.status = 409;
                return next( conflictError );
            }            
            const hashedPassword = security.hashPassword( password );
            let user = new User({ 
                username, 
                email: emailOfUser, 
                password: hashedPassword, 
                userRole: "user",                 
                registeredAt: new Date() 
            });
            user.save((dbError, savedUser) => {
                if (dbError) return next( dbError );
                const validationToken = security.getValidationToken( username, "user", String(savedUser._id) );
                const { CLIENT_URL: clientURL } = process.env;
                const validationURL = clientURL + "#validate/" + validationToken;
                email.sendRegistrationEmail( username, emailOfUser, validationURL );
                res.send({ username, email });
            }); 
        });        
    });

    router.get('/auth/validate/:token', function(req, res) {
        const { token } = req.params;
        res.send(token);
    });

    return router;
}
