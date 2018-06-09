const $     = require("jquery");
const ko    = require("knockout");
const fs    = require('fs');
const config = require("../../config");
const moment = require("moment");
const websocket = require("../../service/websocket");
const security = require("../../service/security");
const translato = require("translato");
const event = require("../../service/event");

let path        = "articles/:id";
let template    = fs.readFileSync( __dirname + "/../../../html/articles/detail.html", 'utf8' );
let socketConnection = null;
let viewModel   =
{
    userRole: ko.observable( "" ),
    isLoading: ko.observable(false),
    error: ko.observable( false ),
    isLoadingComments: ko.observable(false),
    commentsError: ko.observable( false ),

    articleId: "",
    title: ko.observable(""),
    content: ko.observable(""),
    modifiedAt: ko.observable(null),
    images: ko.observableArray([]),
    screenWidth: ko.observable(window.innerWidth),

    newComment: ko.observable(""),
    comments: ko.observableArray([]),
    
    moment: moment,
    saveComment: saveComment
};

function onActive()
{
    console.log("[ArticleDetail] View ready");
    
    _setContent( this.contentEl );
    _setTopRightCornerAction( this.topRightEl );

    _loadArticle();
    _loadComments();

    if( socketConnection !== null )
    {
        socketConnection.on("NewComment", comment => {
            viewModel.comments.push( comment );
        });
    }
}

function onBefore( done, params )
{
    event.broadcast("ChangeTitle", { title: "article.title", isTranslationKey: true });

    viewModel.userRole( security.getUserRole() );
    viewModel.articleId = params.id;  
    viewModel.isLoading(true);
    viewModel.isLoadingComments(true);

    websocket.connect()
    .then( connection => {
        socketConnection = connection;
        done();
    })
    .catch(err => {
        console.warn("[ArticleDetail] Could not get socket connection.", err);
        done();
    });
}

function onLeave()
{
    console.log("[ArticleDetail] Left view");
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

/**
 *  Set the content element and apply the translated template.
 *  Set the screen width to the viewModel and apply knockout js.
 *  @param {DOMNode} contentEl - Main DOMNode where content is displayed
 *  @returns {void}
 */
function _setContent( contentEl )
{
    contentEl.innerHTML = translato.translateHTML(template);
    viewModel.screenWidth( $(contentEl).width() );
    ko.applyBindings( viewModel, contentEl );
}

/**
 *  Apply a button or an other action item to the top right
 *  DOMNode element in the header.
 *  @param {DOMNode} topRightEl - DOMNode in the top right corner of the header
 *  @returns {void}
 */
function _setTopRightCornerAction( topRightEl )
{
    if( viewModel.userRole() === "user" )
    {
        topRightEl.innerHTML = `
            <a href="#articles/editor/${viewModel.articleId}" class="btn btn-info pull-right"><i class="fa fa-pencil"></i></a>
        `;
    }
}

function _loadArticle()
{
    $.get( config.serverUrl + "/articles/" + viewModel.articleId ).then( response => {
        let { article } = response;
        viewModel.title( article.title );
        viewModel.content( article.content );
        viewModel.modifiedAt( article.modifiedAt );
        viewModel.images( article.images );
    }).catch( err => {
        console.error( err );
        viewModel.error("Inhalt konnte nicht geladen werden.");
    }).always( () => {        
        viewModel.isLoading( false );
    });
}

function _loadComments()
{
    $.get(`${config.serverUrl}/articles/${viewModel.articleId}/comments`).then( response => {
        let { articleComments } = response;
        viewModel.comments( articleComments );
    }).catch( err => {
        console.error( err );
        viewModel.commentsError("Kommentare konnten nicht geladen werden.");
    }).always( () => {        
        viewModel.isLoadingComments( false );
    });
}

module.exports = { path, onActive, onBefore, onLeave };