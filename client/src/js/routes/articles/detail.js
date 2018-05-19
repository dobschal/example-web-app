const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../../config");
const swal  = require("sweetalert");

let path        = "articles/:id";
let template    = fs.readFileSync(__dirname + "/../../../html/articles/detail.html", 'utf8');
let viewModel   = {};

function onActive( params, query )
{
    console.log("[articles/detail.js] View ready");
    this.titleEl.innerHTML = "Artikel";
    this.contentEl.innerHTML = template;
    ko.applyBindings( viewModel, this.contentEl );
}

function onBefore( done, params )
{
    done();
}

function onLeave()
{
    console.log("[articles/detail.js] Left view");
}

module.exports = { path, onActive, onBefore, onLeave };