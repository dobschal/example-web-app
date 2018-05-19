const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../config");
const swal  = require("sweetalert");
const event = require("../service/event");

let path        = "login";
let template    = fs.readFileSync(__dirname + "/../../html/login.html", 'utf8');
let viewModel    =
{
    username: ko.observable(""),
    password: ko.observable(""),
    login
};
let context = null;

function onActive( params, query )
{
    console.log("[login.js] View ready");
    this.titleEl.innerHTML = "Login";
    this.contentEl.innerHTML = template;
    ko.applyBindings( viewModel, this.contentEl );
}

function onBefore( done, params )
{
    console.log("[login.js] Enter view");
    context = this;
    done()
}

function onLeave()
{
    console.log("[login.js] Left view");
}

function login( data )
{
    let username = viewModel.username();
    let password = viewModel.password();
    if( !username || !password ) return swal("Eingabe fehlt", "Bitte gibt Username und Passwort ein!", "error");
    $.post( config.serverUrl + "/login", { username, password }).then( response => {
        console.log( "[login.js] Logged in successfully. ", response );
        window.localStorage.setItem("token", response.token);
        event.broadcast("UserChanged");
        swal("Erfolgreich", "Nutzer wurde angemeldet!", "success");
        context.router.navigate("#");
    }).catch( error => {
        console.error( "[login.js] Error on logging in.", error );
        swal("Fehler", "Nutzer konnte nicht angemeldet werden!", "error");
    });
}

module.exports = { path, onActive, onBefore, onLeave };