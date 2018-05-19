const express = require('express');
const router  = express.Router();
const security = require("../services/security");
const User = require("../models/User");

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

    router.post('/register', function(req, res, next) {
        const { username, password } = req.body;
        const hashedPassword = security.hashPassword( password );
        let user = new User({ username, password: hashedPassword, userRole: "user" });
        user.save((err, user) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved user in database." });
        });
    });

    return router;
}
