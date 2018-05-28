const $ = require("jquery");
const ko = require("knockout");
const security = require("./service/security");
const event = require("./service/event");
const translato = require("translato");

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
        .then(function() {
            console.log("[main.js] Service Worker Registered");
        })
        .catch(function(err) {
            console.error("[main.js] Service Worker Failed to Register", err);
        });        
    }
    else
    {
        console.warn("[MainController] Service worker aren't available.");
    }
}

/**
 *  On User Change update the navigation in the sidebar.
 */
event.on("UserChanged", () => {
    let userRole = security.getUserRole();
    let defaultNavItems =
    [
        { href: "#", name: "Start" },
        { href: "#articles", name: "Articles" },
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
            { href: "#login", name: "Login" },
            { href: "#register", name: "Register" }
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

    let token = window.localStorage.getItem("token");
    userIsAuthenticated = token === null ? false : true;
    $.ajaxSetup({ 
        headers:
        { 
            'Authorization': token === null ? "" : "Bearer " + token 
        }
    });    
    event.broadcast("UserChanged");

    data.titleEl.innerHTML = "";
    data.contentEl.innerHTML = `<div class="in-progress"></div>`;

    if( window.innerWidth < 768 ) $("#wrapper").removeClass("toggled");

});

/**
 *  After route handler get dispatched this code is executed.
 */
event.on("LeaveRoute", data => {

    console.log("[MainController] LeaveRoute event handler.");

});

module.exports = main;