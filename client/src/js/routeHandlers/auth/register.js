const $          = require("jquery");
const ko         = require("knockout");
const fs         = require('fs');
const config      = require("../../config");
const swal       = require("sweetalert");
const translater = require("translato");
const event      = require("../../service/event");
const Parsley    = require("parsleyjs");

require("parsleyjs");

let path          = "register";
let template      = fs.readFileSync(__dirname + "/../../../html/register.html", 'utf8');
let formValidator = null;
let router        = null;
let viewModel     =
{
    username: ko.observable(""),
    email: ko.observable(""),
    password: ko.observable(""),    
    passwordRepeat: ko.observable(""),
    isSendingRequest: ko.observable(false),
    register
};

function onActive( params, query )
{    
    console.log("[register.js] View ready");
    this.titleEl.innerHTML = "Register new User";
    this.contentEl.innerHTML = translater.translateHTML(template);
    ko.applyBindings( viewModel, this.contentEl );    
    _addFormValidator();
}

function onBefore( done, params )
{
    router = this.router;
    event.broadcast("ChangeTitle", { title: "register.title", isTranslationKey: true });
    console.log("[Register] OnBefore Hook. Enter view", this);
    done();
}

function onLeave()
{
    console.log("[register.js] Left view");
}

function register()
{
    formValidator.whenValid().then( () => {
        console.log("[Registration] Register user...");
        let username = viewModel.username();
        let password = viewModel.password();
        let email = viewModel.email();
        viewModel.isSendingRequest( true );
        $.post( config.serverUrl + "/register", { username, password, email }).then( response => {
            console.log( "[Registration] Successfull: ", response );
            window.localStorage.setItem("username", username);
            swal("Erfolgreich", "Nutzer wurde registriert!", "success").then( () => {
                router.navigate( `login` );
            });
        }).catch( error => {
            console.error( "[Registration] Error on response: ", error );
            swal("Fehler", "Nutzer konnte nicht registriert werden!", "error");
        }).always( () => {
            viewModel.isSendingRequest( false );
        });
    });
}

function _addFormValidator()
{    
    Parsley.addValidator('userExists', {
        validateString: function( username )
        {
            return new Promise( (resolve, reject) => {
                console.log("[Registration] Validate username.");
                let xhr = $.get( config.serverUrl + "/user/" + username );
                xhr.then( () => {
                    reject( new Error("User with username already exists.") );
                }, error => {
                    if( error.status === 404 ) return resolve("Everything nice here :)");
                    let translations = translater.translateKeys("general.error", "error.internal");
                    swal(translations[0], translations[1], "error");
                    console.error("[Registration] Cannot validate username!", error);
                } );
            });
        },
        messages: { 
            en: 'A user with this username already exists.',
            de: 'Der Benutzername ist leider schon vergeben'
        }
    });
    formValidator = $('#registration-form').parsley().on('form:submit', function() {
        return false; // Don't submit form
    });
    
}

module.exports = { path, onActive, onBefore, onLeave };