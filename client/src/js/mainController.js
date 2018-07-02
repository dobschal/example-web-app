const $             = require("jquery");
const ko            = require("knockout");
const config         = require("./config");
const event         = require("./service/event");
const moment        = require("moment");
const security      = require("./service/security");
const translato     = require("translato");
const dictionary    = require("./dictionary.json");
const parsley       = require("parsleyjs");
const Hammer        = require("hammerjs");
const toastr        = require("toastr");
const util          = require("./service/util");

//  Locale files for moment and parsley js
require("../../node_modules/moment/locale/de");
require("../../node_modules/parsleyjs/dist/i18n/de");

let navigationModel =
{
    items: ko.observableArray( [] )
};
let userIsAuthenticated = false;

/**
 *  @description This method is called on start of the application 
 *  and is called only one time while the app is running!
 *  @returns {void}
 */
function main()
{
    _registerServiceWorker();
    
    _setLanguage();
    
    $("#menu-toggle").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    $(window).resize(function() {
        if( window.innerWidth < 768 )
        {
            $("#wrapper").removeClass("toggled");
        }
        else
        {
            $("#wrapper").addClass("toggled");
        }
    }); 
    
    if( util.isMobileDevice() )
    {
        
        // Uncomment this to enable text selection and swipe to toggle menu at same time.
        // delete Hammer.defaults.cssProps.userSelect;

        var hammertime = new Hammer( $("#wrapper")[0] );
        hammertime.get('pan').set({ threshold: 100 });
        hammertime.on('panleft', function(e) {
            console.log("[MainController] User is swiping.", e);
            $("#wrapper").removeClass("toggled");        
        });
        hammertime.on('panright', function(e) {
            console.log("[MainController] User is swiping.", e);
            $("#wrapper").addClass("toggled");
        });    
    }

    ko.applyBindings( navigationModel, this.sidebarEl );
}

/**
 *  @description Register service worker to cache files and provide offline functionality.
 *  @returns {void}
 */
function _registerServiceWorker()
{
    if ('serviceWorker' in navigator)
    {
        navigator.serviceWorker
        .register( "./service-worker.js", { scope: './' })
        .then(function( register ) {
            console.log("[MainController] Service Worker Registered");
            event.broadcast("RegisteredServiceWorker", register);
        })
        .catch(function(err) {
            console.error("[MainController] Service Worker Failed to Register", err);
        });
    }
    else
    {
        console.warn("[MainController] Service worker aren't available.");
    }
}
  

/**
 *  Translate the whole page in a different language. Sets the language also in
 *  the plugins.
 *  @param {string} languageKey - "de", "en"
 *  @returns {void}
 */
function _setLanguage( languageKey )
{
    let languageToSet = config.defaultLanguage;
    if( languageKey )
    {
        languageToSet = languageKey;
        window.localStorage.setItem("languageKey", languageKey);
    }
    else if( window.localStorage.getItem("languageKey") )
    {
        languageToSet = window.localStorage.getItem("languageKey");
    }
    translato.setDictionary( dictionary );
    translato.setLocale( languageToSet, true );
    moment.locale( languageToSet );
    parsley.setLocale( languageToSet );
}

/**
 *  Check if a auth token is stored. If true, set the
 *  token as auth header.
 *  Broadcast the userChanged event.
 *  @returns {void}
 */
function _updateUserAuthorization()
{
    let token = null;
    if( security.isTokenExpired() )
    {
        toastr.info( translato.translateKeys("general.autoLogout") );
        window.localStorage.removeItem("token");
    }
    else
    {
        token = window.localStorage.getItem("token");
    }
    userIsAuthenticated = token === null ? false : true;
    $.ajaxSetup({ 
        headers:
        { 
            'Authorization': userIsAuthenticated ? "Bearer " + token : ""
        }
    });    
    event.broadcast("UserChanged", userIsAuthenticated);
}

/**
 *  @param {object} worker - Service worker instance got from service worker registration
 *  @returns {void}
 */
function _registerPushNotifications( worker )
{
    worker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: util.urlBase64ToUint8Array( config.pushNotificationPublicKey )
    })
    .then( subscription => {        
        console.log("[MainController] Push registered.", subscription);
        fetch(config.serverUrl + "/push/register", {
            body: JSON.stringify( subscription ),
            method: "post",
            headers: { 
                "content-type": "application/json"
            }
        }).then(console.log).catch(console.error);
    })
    .catch( err => console.error( "[MainController] Unable to register push notifications.", err ) );
}

/**
 *  After the service worker is registered we can use it here.
 */
event.on("RegisteredServiceWorker", worker => {
    _registerPushNotifications( worker );
});

/**
 *  On User Change update the navigation in the sidebar.
 */
event.on("UserChanged", () => {
    let userRole = security.getUserRole();
    let defaultNavItems =
    [
        { href: "#", name: "Start", icon: "fa fa-home" },
        { href: "#articles", name: "Articles", icon: "fa fa-book" },
        { href: "#products", name: "Products" }
    ];
    switch( userRole )
    {
        case "user": navigationModel.items(defaultNavItems.concat([
            { href: "#logout", name: "Logout" }
        ]));
        break;
        case "admin": navigationModel.items(defaultNavItems.concat([
            { href: "#logout", name: "Logout" }
        ]));
        break;
        default: navigationModel.items(defaultNavItems.concat([
            { href: "#login", name: "Login", icon: "fa fa-user" },
            { href: "#register", name: "Register", icon: "fa fa-user-plus" }
        ]));
    }
});

/**
 *  If route handler broadcasts event to change title
 *  we change the title in the top header and the browser tab.
 *  eventData = { title, isTranslationKey, querySelector }
 */
event.on("ChangeTitle", data => {

    console.log("[MainController] Change page title.");
    let { title, isTranslationKey, querySelector } = data;
    if( isTranslationKey )
    {
        title = translato.translateKeys( title );
    }
    let titleEl = document.querySelector("title");
    titleEl.innerText = title;

    let pageTitleEl = document.querySelector( querySelector || "#page-title");
    pageTitleEl.style.transition = "transform 1s ease-in-out";
    // pageTitleEl.style.transition = "font-size";
});

/**
 *  Before every route handler is applied execute this code.
 */
event.on("BeforeRouteChange", data => {

    console.log("[MainController] BeforeRouteChange event handler.");

    ko.cleanNode(data.contentEl);
    ko.cleanNode(data.titleEl);
    
    data.topRightEl.innerHTML = "";
    data.titleEl.innerHTML = "";
    data.contentEl.innerHTML = `<div class="in-progress"><span id="loading-message"></span></div>`;

    _updateUserAuthorization();

    if( window.innerWidth < 768 ) $("#wrapper").removeClass("toggled");

});

/**
 *  After route handler get dispatched this code is executed.
 */
event.on("LeaveRoute", data => {

    console.log("[MainController] LeaveRoute event handler.", data);

});

/**
 *  Sets the language for all plugins and translates the whole page.
 */
event.on("ChangeLanguage", languageKey => {
    _setLanguage( languageKey );
});

module.exports = main;