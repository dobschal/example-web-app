const $         = require("jquery");
const ko        = require("knockout");
const fs        = require('fs');
const config     = require("../../config");
const swal      = require("sweetalert");
const Quill     = require("quill");
const translater = require("translato");

let path        = "articles/editor";
let template    = fs.readFileSync(__dirname + "/../../../html/articles/editor.html", 'utf8');
let viewModel   = {
    editorContent: ko.observable(""),
    editor: null,
    save: save
};

function onActive( params, query )
{
    console.log("[articles/editor.js] View ready");
    
    this.titleEl.innerHTML = "Artikel Bearbeiten";
    this.contentEl.innerHTML = translater.translateHTML( template );

    viewModel.editor = new Quill('#editor', {
        modules: { toolbar: '#toolbar' },
        theme: 'snow'
    });

    ko.applyBindings( viewModel, this.contentEl );

    setTimeout( () => {
        viewModel.editorContent("<b>Yes it works :)</b>");        
        translater.setLocale("en", true);
    }, 3000);

}

function onBefore( done, params )
{
    $("title").text("Article");
    console.log("[articles/editor.js] Enter view");
    done();
}

function onLeave()
{
    console.log("[articles/editor.js] Left view");
}

function save()
{
    console.log( "[editor.js] Save content: ", viewModel.editorContent());
}

module.exports = { path, onActive, onBefore, onLeave };