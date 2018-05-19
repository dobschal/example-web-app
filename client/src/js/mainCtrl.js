const $ = require("jquery");
const ko = require("knockout");
const security = require("./service/security");
const event = require("./service/event");

let navigationModel =
{
    items: ko.observableArray( [] )
};

//  This method is called on start of the application
//  and is called only once while app is running!
function mainCtrl()
{

    if ('serviceWorker' in navigator)
    {
        navigator.serviceWorker
        .register( "./service-worker.js", { scope: './' })
        .then(function(registration) {
            console.log("[mainCtrl.js] Service Worker Registered");
        })
        .catch(function(err) {
            console.error("[mainCtrl.js] Service Worker Failed to Register", err);
        });        
    }
    
    $("#menu-toggle").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    $(window).resize(function(e) {
        if( window.innerWidth < 768 )
        {
            $("#wrapper").removeClass("toggled");
        }
        else
        {
            $("#wrapper").addClass("toggled");
        }
    });

    _updateNavigationItems();
    event.on("UserChanged", _updateNavigationItems);

    ko.applyBindings( navigationModel, this.sidebarEl );

}

function _updateNavigationItems()
{
    let userRole = security.getUserRole();
    let defaultNavItems =
    [
        { href: "#", name: "Start" },
        { href: "#articles", name: "Articles" },
        { href: "#products", name: "Products" }
    ];
    switch( userRole )
    {
        case "user": navigationModel.items(defaultNavItems.concat([
            { href: "#logout", name: "Logout" }
        ]));
        break;
        case "admin": navigationModel.items(defaultNavItems.concat([
            { href: "#logout", name: "Logout" }
        ]));
        break;
        default: navigationModel.items(defaultNavItems.concat([
            { href: "#login", name: "Login" },
            { href: "#register", name: "Register" }
        ]));
    }
}

module.exports = mainCtrl;