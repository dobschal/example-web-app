const express = require('express');
const router  = express.Router();
const webPush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;

module.exports = function( io ) {

    webPush.setVapidDetails("mailto:sascha@dobschal.eu", publicKey, privateKey );

    router.post('/register-push', function(req, res, next) {
        let subscription = req.body;
        let notificationPayload = JSON.stringify({ title: "Welcome!", body: "Pushs are now available." });

        let pushSubscription = new PushSubscription( subscription );
        pushSubscription.save((dbError, savedSubscription) => {
            if (dbError) return next( dbError );
            webPush.sendNotification( subscription, notificationPayload )
            .then(res.send({ success: true, subscription: savedSubscription }))
            .catch( err => next(err) );
        });
    });

    return router;
};