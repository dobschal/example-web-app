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
                err = new Error("Permission denied.");
                err.status = 401;
                return next( err );
            }
            const token = security.getToken( user.username, user.userRole, user._id + "" );
            res.send({ success: true, token });
        });
    });

    router.get("/user/:username", function( req, res, next) {
        const { username } = req.params;
        
        email.sendRegistrationEmail();

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
        const { username, email, password } = req.body;
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
                email, 
                password: hashedPassword, 
                userRole: "user",                 
                registeredAt: new Date() 
            });
            user.save((err, savedUser) => {
                if (err) return next( err );
                res.send({ username, email });
            }); 
        });        
    });

    return router;
}
