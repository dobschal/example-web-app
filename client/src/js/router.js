require("./service/knockoutBindings/editorContent");
require("./service/knockoutBindings/image");
require("../../node_modules/moment/locale/de");

const Navigo            = require("navigo");
const translato         = require("translato");
const moment            = require("moment");
const mainCtrl          = require("./mainController");
const dictionary        = require("./dictionary.json");
const event             = require("./service/event");

/**
 *  Use translato to translate page.
 *  Set language code and dictionary here.
 *  Dictionary is just a json, containing all translations.
 */
translato.setLocale("de");
translato.setDictionary( dictionary );
moment.locale('de');

/**
 *  All routeControllers. Order is important!
 */
const routeHandlers = [
    require("./routeHandlers/articles/list"),
    require("./routeHandlers/articles/editor"),
    require("./routeHandlers/articles/detail"),
    require("./routeHandlers/products/index"),
    require("./routeHandlers/auth/register"),
    require("./routeHandlers/auth/login"),
    require("./routeHandlers/auth/logout"),
    require("./routeHandlers/start/index")
];

var router = new Navigo(null, true);

/**
 *  Custom bindings to each hook and viewController.
 *  Add things you need access to inside a controller or hook.
 */
var bindings = {
    router: router,
    doc: document,
    win: window,
    sidebarEl: document.getElementById("sidebar-wrapper"),
    contentEl: document.getElementById("page-content"),
    titleEl: document.getElementById("page-title")
};

router.hooks({
    before: done => {
        event.broadcast( "BeforeRouteChange", bindings );
        done();
    },
    after: () => {
        event.broadcast( "AfterRouteChange", bindings );
    },
    leave: () => {
        event.broadcast( "LeaveRoute", bindings );
    }
});

mainCtrl.call( bindings, null );

routeHandlers.forEach( routeHandler => {    

    let { 
        path,     // String        
        onActive, // function
        onBefore, // function, optional
        onAfter,  // function, optional
        onLeave   // function, optional
    } = routeHandler;

    if( !path || !onActive ) throw new Error("[router.js] Missing path string or onActive method in RouteHandler!");

    let hooks = {};
    if( typeof onBefore === "function" ) hooks.before = onBefore.bind( bindings );
    if( typeof onLeave === "function" ) hooks.leave = onLeave.bind( bindings );
    if( typeof onAfter === "function" ) hooks.after = onAfter.bind( bindings );

    router.on( path, onActive.bind( bindings ), hooks );
});  

router.notFound( () => {
    alert("Route not found...");
});

router.resolve();


