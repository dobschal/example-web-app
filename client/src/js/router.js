require("../../node_modules/bootstrap/dist/js/bootstrap.bundle");
require("./knockoutBindings/editorContent");
//require("./knockoutBindings/animation");

const Navigo    = require("navigo");
const mainHook  = require("./hooks/beforeAll");
const mainCtrl  = require("./mainCtrl");
const translato = require("translato");
const dictionary = require("./dictionary.json");

/**
 *  Use translato to translate page.
 *  Set language code and dictionary here.
 *  Dictionary is just a json, containing all translations.
 */
translato.setLocale("de");
translato.setDictionary( dictionary );

/**
 *  All routeControllers. Order is important!
 */
const routeHandlers = [
    require("./routes/articles/list"),
    require("./routes/articles/editor"),
    require("./routes/articles/detail"),
    require("./routes/product"),
    require("./routes/register"),
    require("./routes/login"),
    require("./routes/logout"),
    require("./routes/start")
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
    before: mainHook.bind( bindings )
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


