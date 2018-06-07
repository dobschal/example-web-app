require("./service/knockoutBindings/editorContent");
require("./service/knockoutBindings/image");

const Navigo            = require("navigo");
const mainCtrl          = require("./mainController");
const event             = require("./service/event");

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

        router.on( pathName, onActive.bind( bindings ), hooks );

    });
});  

router.notFound( () => {
    alert("Route not found...");
});

router.resolve();


