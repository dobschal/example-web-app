const express = require('express');
const router  = express.Router();
const webPush = require("web-push");

const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;

module.exports = function( io ) {

    webPush.setVapidDetails("mailto:sascha@dobschal.eu", publicKey, privateKey );

    router.post('/register-push', function(req, res, next) {
        let subscription = req.body;
        let notificationPayload = JSON.stringify({ title: "Welcome!", body: "Pushs are now available." });
         webPush.sendNotification( subscription, notificationPayload )
         .then(res.send({ success: true }))
         .catch( err => next(err) );
    });

    return router;
};