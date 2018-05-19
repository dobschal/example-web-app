const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../config");
const swal  = require("sweetalert");

let path        = "register";
let template    = fs.readFileSync(__dirname + "/../../html/register.html", 'utf8');
let viewModel    =
{
    username: ko.observable(""),
    password: ko.observable(""),
    register
};

function onActive( params, query )
{
    console.log("[register.js] View ready");
    this.titleEl.innerHTML = "Register new User";
    this.contentEl.innerHTML = template;
    ko.applyBindings( viewModel, this.contentEl );
}

function onBefore( done, params )
{
    console.log("[register.js] Enter view");
    done()
}

function onLeave()
{
    console.log("[register.js] Left view");
}

function register( data )
{
    let username = viewModel.username();
    let password = viewModel.password();
    if( !username || !password ) return swal("Eingabe fehlt", "Bitte gibt Username und Passwort ein!", "error");
    $.post( config.serverUrl + "/register", { username, password }).then( response => {
        console.log( response );
        swal("Erfolgreich", "Nutzer wurde registriert!", "success");
    }).catch( error => {
        console.error( error );
        swal("Fehler", "Nutzer konnte nicht registriert werden!", "error");
    });
}

module.exports = { path, onActive, onBefore, onLeave };