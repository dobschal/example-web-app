const Util = require("./service/Util");
const Navigo = require("navigo");

const productCtrl = require("./ctrl/productCtrl");

Util.addServiceWorker( "./service-worker.js" );

Util.on("loaded", e => {
    console.log("Application started...");
    var router = new Navigo(null, true);
    router
    .on({
        'products/:id': productCtrl,
        'products': productCtrl,
        '*':  () => { alert("Huhu :) "); }
    })
    .resolve();
});
