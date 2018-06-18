const $ = require("jquery");
const fs = require("fs");
const ko = require("knockout");
const alert = require("sweetalert");
const event = require("../../service/event");
const config = require("../../config");
const toastr = require("toastr");
const security = require("../../service/security");
const translater = require("translato");

const template    = fs.readFileSync( __dirname + "/../../../html/admin/index.html", 'utf8' );
const path = "admin";
let viewModel = {
    users: ko.observableArray()
};

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

    $.get( config.serverUrl + "/users" )
    .then( users => {
        console.log("[Admin] Users from api: ", users);
        viewModel.users( users );
        done();
    })
    .catch( err => {
        console.error("[Admin] Unable to load users...", err);
        toastr.error("Unable to load users...");
        done(false);
    });    
}

module.exports = { path, onActive, onBefore };