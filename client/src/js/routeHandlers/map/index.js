const event = require("../../service/event");
const fs = require("fs");

let template    = fs.readFileSync( __dirname + "/../../../html/map.html", 'utf8' );
const paths = ["map"];

function onActive( params )
{
    console.log("[MapView] Is active. Parameter:  ", params);
    this.contentEl.innerHTML = template;
}

function onBefore( done, params )
{
    event.broadcast("ChangeTitle", { title: "map.title", isTranslationKey: true });
    console.log("[MapView] Is before active. Parameter:  ", params);
    done();
}

module.exports = { onActive, onBefore, paths };