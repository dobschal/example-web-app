require("./service/knockoutBindings/editorContent");
require("./service/knockoutBindings/image");

const Navigo            = require("navigo");
const mainCtrl          = require("./mainController");
const event             = require("./service/event");

/**
 *  All routeControllers. Order is important!
 */
const loadedScripts = require('./routeHandlers/**/*.js', { mode: 'list' });
const routeHandlers = loadedScripts.map( item => item.module );

console.log("[Router] RouteHandlers: ", routeHandlers);

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
    titleEl: document.getElementById("page-title"),
    topRightEl: document.getElementById("top-right-corner")
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

let routes = [];

routeHandlers.forEach( routeHandler => { 

    let { 
        path,     // String
        paths,    // Array<String>
        onActive, // function
        onBefore, // function, optional
        onAfter,  // function, optional
        onLeave   // function, optional
    } = routeHandler;

    if( path && !paths )
    {
        paths = [path];
    }
    else if( !path && !paths )
    {
        throw new Error("[Route] Missing path string in route handler.", routeHandler);
    }
    
    paths.forEach( pathName => {

        if( !onActive ) throw new Error("[Router] Missing onActive method in RouteHandler!", routeHandler);

        let hooks = {};
        if( typeof onBefore === "function" ) hooks.before = onBefore.bind( bindings );
        if( typeof onLeave === "function" ) hooks.leave = onLeave.bind( bindings );
        if( typeof onAfter === "function" ) hooks.after = onAfter.bind( bindings );

        routes.push( { pathName, onActive: onActive.bind( bindings ), hooks });
    });
});

/**
 *  We need to sort the routes before they are passed to the router
 *  because else problems appear.
 *  i.e.:   "/articles/:id" and "/articles/editor" 
 *          will cause problems if in wrong order
 *  Parameterized paths schould come at last.
 */
routes.sort( (a, b) => {
    if(a.pathName.length < b.pathName.length) return 1;
    if(a.pathName.length > b.pathName.length) return -1;
    return 0;
});
// routes.sort( (a, b) => {
//     if(a.pathName.includes(":") && !b.pathName.includes(":")) return 1;
//     if(!a.pathName.includes(":") && b.pathName.includes(":")) return -1;
//     return 0;
// });
console.log("[Router] Sorted routes: ", routes);

routes.forEach( route => {
    router.on( route.pathName, route.onActive, route.hooks );
});

router.notFound( () => {
    alert("Route not found...");
});

router.resolve();


