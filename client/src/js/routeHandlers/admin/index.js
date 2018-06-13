const security = require("../../service/security");
const alert = require("sweetalert");
const translater = require("translato");
const fs = require("fs");
const ko = require("knockout");
const event = require("../../service/event");

const template    = fs.readFileSync( __dirname + "/../../../html/articles/detail.html", 'utf8' );
const path = "admin";
let viewModel = {};

function onActive()
{
    this.contentEl.innerHTML = translater.translateHTML( template );
    ko.applyBindings( viewModel, this.contentEl );
}

function onBefore( done )
{
    event.broadcast("ChangeTitle", { title: "Admin" });
    if( security.getUserRole() !== "admin" )
    {
        let translations = translater.translateKeys("general.error", "errors.notEnoughRights");
        alert( translations[0], translations[1], "error" );
        return done(false);
    }
    done();
}

module.exports = { path, onActive, onBefore };