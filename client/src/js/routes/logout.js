const swal = require("sweetalert");
const event = require("../service/event");

let path        = "logout";

function onActive( params, query )
{
    console.log("[logout.js] View ready");    
}

function onBefore( done, params )
{
    console.log("[logout.js] Enter view");
    window.localStorage.removeItem("token");
    event.broadcast("UserChanged");
    this.router.navigate("login");
    swal("Abgemeldet", "Du wurdest erfoglreich abgemeldet.", "success");
    done(false);
}

function onLeave()
{
    console.log("[logout.js] Left view");
}

module.exports = { path, onActive, onBefore, onLeave };