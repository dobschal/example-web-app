const $      = require("jquery");
const ko     = require("knockout");
const fs     = require('fs');
const moment = require("moment");
const config  = require("../../config");
const websocket = require("../../service/websocket");
require("lightbox2");

let path        = "articles";
let template    = fs.readFileSync(__dirname + "/../../../html/articles/list.html", 'utf8');
let viewModel    =
{
    moment: moment, 
    articles: ko.observableArray([]),
    loadingArticles: ko.observable(false),
    errorOnLoading: ko.observable(""),
    authenticated: ko.observable( false ),
    stripHtml: stripHtml
};
let socketConnection = null;

function onActive( params, query )
{
    console.log("[ArticleList] View ready");

    this.titleEl.innerHTML = "Artikel";
    this.contentEl.innerHTML = template;

    ko.applyBindings( viewModel, this.contentEl );

    if( socketConnection !== null)
    {
        socketConnection.on("NewComment", comment => {
            viewModel.articles().forEach( article => {
                if(article._id === comment.articleId) article.comments.push( comment );
            });
        });
    }

    viewModel.loadingArticles(true);
    $.get( config.serverUrl + "/articles" ).then( response => {
        const { articles } = response;
        console.log( "[ArticleList] Load articles from API.", articles );
        window.localStorage.setItem("articles", JSON.stringify( articles ));
        viewModel.articles( articles.map( prepareArticle ));
    }).catch(err => {
        console.error( "[ArticleList] Unable to load data from API.", err );
        viewModel.errorOnLoading("Inhalt konnte nicht geladen werden!");
    }).always( () => {
        viewModel.loadingArticles(false);
    });
}

function onBefore( done, params )
{
    $("title").text("Articles");
    
    console.log("[ArticleList] Enter view");

    viewModel.authenticated(window.localStorage.getItem("token") ? true : false);

    try {
        let cachedArticlesAsString = window.localStorage.getItem("articles");
        let articles = JSON.parse( cachedArticlesAsString );        
        viewModel.articles( Array.isArray( articles ) ? articles.map( prepareArticle ) : [] );
        console.log(`[articles.js] Got ${articles.length} cached articles.`);
    } catch(e) {
        console.log("[articles.js] No cached articles found.", e);
    }

    websocket.connect()
    .then( connection => {
        socketConnection = connection;        
    })
    .catch(console.error)
    .finally(() => {
        done();
    });
}

function onLeave()
{
    console.log("[ArticleList] Left view");
    if( socketConnection !== null)
    {
        socketConnection.removeAllListeners();
    }
}

function prepareArticle( articleItem )
{
    articleItem.comments = ko.observableArray([]);
    $.get(`${config.serverUrl}/articles/${articleItem._id}/comments`).then( response => {
        let { articleComments } = response;
        articleItem.comments(articleComments);
    });
    return articleItem;
}

function stripHtml(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

module.exports = { path, onActive, onBefore, onLeave };