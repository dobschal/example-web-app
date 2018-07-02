const mongoose = require("mongoose");

var pushSubscriptioSchema = mongoose.Schema({
    endpoint: { type: String },
    expirationTime: { type: mongoose.Schema.Types.Mixed },
    options: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('PushSubscriptio', pushSubscriptioSchema);