
const path = "*";

function onActive( params, query )
{
    console.log("[start.js] View ready");
    this.titleEl.innerHTML = "Start";
    this.contentEl.innerHTML = "Welcome to my Page!";
}

function onBefore( done, params )
{
    console.log("[start.js] Enter view");
    done();
}

function onLeave()
{
    console.log("[start.js] Left view");
}

module.exports = { path, onActive, onBefore, onLeave };