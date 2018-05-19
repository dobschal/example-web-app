const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../../config");
const swal  = require("sweetalert");
const websocket = require("../../service/websocket");

let path        = "articles";
let template    = fs.readFileSync(__dirname + "/../../../html/articles/list.html", 'utf8');
let viewModel    =
{
    articles: ko.observableArray([]),
    authenticated: ko.observable( false )
};
let socketConnection = null;

function onActive( params, query )
{
    console.log("[articles/list.js] View ready");
    this.titleEl.innerHTML = "Artikel";
    this.contentEl.innerHTML = template;
    ko.applyBindings( viewModel, this.contentEl );

    socketConnection.on("NewComment", comment => {
        viewModel.articles().forEach( article => {
            if(article._id === comment.articleId) article.comments.push( comment );
        });
    });
}

function onBefore( done, params )
{
    console.log("[articles/list.js] Enter view");

    viewModel.authenticated(window.localStorage.getItem("token") ? true : false);

    websocket.connect().then( connection => {
        socketConnection = connection;
    }).catch(console.error);

    $.get( config.serverUrl + "/articles" ).then( response => {
        const { articles } = response;
        viewModel.articles( articles.map( prepareArticle ));
        done();
    }).catch(err => {
        this.contentEl.innerHTML = "Inhalt konnte nicht geladen werden!";
        done( false );
    });
}

function onLeave()
{
    console.log("[articles/list.js] Left view");

    socketConnection.removeAllListeners();

}

function saveComment()
{
    const articleId = this._id;
    const content = this.newComment();
    this.newComment( "" );
    $.post(`${config.serverUrl}/articles/${articleId}/comment`, { content })
        .then( console.log )
        .catch( console.error );
}

function prepareArticle( articleItem )
{
    articleItem.newComment = ko.observable("");
    articleItem.saveComment = saveComment;
    articleItem.comments = ko.observableArray([]);
    $.get(`${config.serverUrl}/articles/${articleItem._id}/comments`).then( response => {
        console.log("[articles/list.js] Got comments from server.", response);
        let { articleComments } = response;
        articleItem.comments(articleComments);
    });
    return articleItem;
}

module.exports = { path, onActive, onBefore, onLeave };