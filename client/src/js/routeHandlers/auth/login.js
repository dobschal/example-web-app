const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../../config");
const swal  = require("sweetalert");
const event = require("../../service/event");

let path        = "login";
let template    = fs.readFileSync(__dirname + "/../../../html/login.html", 'utf8');
let viewModel    =
{
    username: ko.observable(""),
    password: ko.observable(""),
    login,
    isLoading: ko.observable( false )
};
let router = null;

function onActive( params, query )
{
    console.log("[Login] View ready");
    this.titleEl.innerHTML = "Login";
    this.contentEl.innerHTML = template;
    ko.applyBindings( viewModel, this.contentEl );
    
    _prefillUsername();
}

function onBefore( done )
{
    console.log("[Login] Enter view");
    router = this.router;
    done();
}

function onLeave()
{
    console.log("[Login] Left view");
}

function login( data )
{
    let username = viewModel.username();
    let password = viewModel.password();
    if( !username || !password ) return swal("Eingabe fehlt", "Bitte gibt Username und Passwort ein!", "error");
    viewModel.isLoading( true );
    $.post( config.serverUrl + "/login", { username, password }).then( response => {
        console.log( "[Login] Logged in successfully. ", response );
        window.localStorage.setItem("token", response.token);
        window.localStorage.setItem("username", username );        
        event.broadcast("UserChanged");
        swal("Erfolgreich", "Nutzer wurde angemeldet!", "success").then( () => {            
            router.navigate("#");
        });        
    }).catch( error => {
        console.error( "[Login] Error on logging in.", error );
        swal("Fehler", "Nutzer konnte nicht angemeldet werden!", "error").then( () => {
            $("#username-input").focus();
        });
    }).always( () => {
        viewModel.isLoading( false );
    });
}

function _prefillUsername()
{
    if( window.localStorage.getItem("username") )
    {
        viewModel.username( window.localStorage.getItem("username") );
    }
}

module.exports = { path, onActive, onBefore, onLeave };