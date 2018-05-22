const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../../config");
const moment = require("moment");
const websocket = require("../../service/websocket");

let path        = "articles/:id";
let template    = fs.readFileSync( __dirname + "/../../../html/articles/detail.html", 'utf8' );
let socketConnection = null;
let viewModel   =
{
    authenticated: ko.observable(false),
    isLoading: ko.observable(false),
    error: ko.observable( false ),
    isLoadingComments: ko.observable(false),
    commentsError: ko.observable( false ),

    articleId: "",
    title: ko.observable(""),
    content: ko.observable(""),
    modifiedAt: ko.observable(null),
    imageURL: ko.observable(""),

    newComment: ko.observable(""),
    comments: ko.observableArray([]),
    
    moment: moment,
    saveComment: saveComment
};

function onActive()
{
    console.log("[articles/detail.js] View ready");
    
    this.titleEl.innerHTML = "Artikel";
    this.contentEl.innerHTML = template;
    
    ko.applyBindings( viewModel, this.contentEl );

    $.get( config.serverUrl + "/articles/" + viewModel.articleId ).then( response => {
        let { article } = response;
        viewModel.title( article.title );
        viewModel.content( article.content );
        viewModel.modifiedAt( article.modifiedAt );
        viewModel.imageURL( article.image );
    }).catch( err => {
        console.error( err );
        viewModel.error("Inhalt konnte nicht geladen werden.");
    }).always( () => {        
        viewModel.isLoading( false );
    });

    $.get(`${config.serverUrl}/articles/${viewModel.articleId}/comments`).then( response => {
        let { articleComments } = response;
        viewModel.comments( articleComments );
    }).catch( err => {
        console.error( err );
        viewModel.commentsError("Kommentare konnten nicht geladen werden.");
    }).always( () => {        
        viewModel.isLoadingComments( false );
    });

    if( socketConnection !== null )
    {
        socketConnection.on("NewComment", comment => {
            viewModel.comments.push( comment );
        });
    }
}

function onBefore( done, params )
{
    $("title").text("Article Detail");
    
    viewModel.authenticated(window.localStorage.getItem("token") ? true : false );  
    viewModel.articleId = params.id;  
    viewModel.isLoading(true);
    viewModel.isLoadingComments(true);

    websocket.connect()
    .then( connection => {
        socketConnection = connection;        
    })
    .catch(err => console.warn("[Articles] Could not get socket connection.", err))
    .finally(() => {
        done();
    });
}

function onLeave()
{
    console.log("[articles/detail.js] Left view");
    if( socketConnection !== null )
    {
        socketConnection.removeAllListeners();
    }
}

function saveComment()
{
    const content = viewModel.newComment();
    viewModel.newComment( "" );
    $.post(`${config.serverUrl}/articles/${viewModel.articleId}/comment`, { content })
        .then( console.log )
        .catch( console.error );
}

module.exports = { path, onActive, onBefore, onLeave };