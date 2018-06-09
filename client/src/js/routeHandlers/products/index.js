
const path = "products";

function onActive ( params, query )
{
    console.log("[product.js] View ready");
    this.titleEl.innerHTML = "Products";
    this.contentEl.innerHTML = "Hier ist auch noch Inhalt!";
}

function onBefore( done, params )
{    
    console.log("[product.js] Enter view");
    // if( !window.localStorage.getItem("token") )
    // {
    //     done( false );
    //     return this.router.navigate("articles");
    // }
    done();
}

function onLeave()
{
    console.log("[product.js] Left view");
}

module.exports = { path, onActive, onBefore, onLeave };