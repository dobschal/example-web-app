const event = require("../../service/event");

const path = "*";

function onActive()
{
    console.log("[start.js] View ready");
    this.titleEl.innerHTML = "Start";
    this.contentEl.innerHTML = "Welcome to my Page!";
}

function onBefore( done )
{
    console.log("[start.js] Enter view");
    event.broadcast("ChangeTitle", { title: "Start" });
    done();
}

function onLeave()
{
    console.log("[start.js] Left view");
}

module.exports = { path, onActive, onBefore, onLeave };