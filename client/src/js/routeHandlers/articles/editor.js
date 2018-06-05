const $         = require("jquery");
const ko        = require("knockout");
const fs        = require('fs');
const config     = require("../../config");
const swal      = require("sweetalert");
const Quill     = require("quill");
const translater= require("translato");
const security  = require("../../service/security");
const event     = require("../../service/event");
const toastr    = require("toastr");
const ImageUploadArea = require("../../components/ImageUploadArea");

let paths       = [ "articles/editor", "articles/editor/:articleId" ];
let template    = fs.readFileSync(__dirname + "/../../../html/articles/editor.html", 'utf8');
let router      = null;
let loadedImages= [];
let viewModel   = {
    articleTitle: ko.observable(""),
    articleContent: ko.observable(""),
    editor: null,
    uploadArea: null,
    save: save,
    isArticleUpdate: ko.observable(false), // else its a new article
    articleId: ko.observable(""),
    isSendingRequest: ko.observable( false ),
    uploadProgress: ko.observable("0%")
};

function onActive( params, query )
{
    router = this.router;
    console.log("[ArticleEditor] View ready");
    this.titleEl.innerHTML = "Artikel Bearbeiten";
    this.contentEl.innerHTML = translater.translateHTML( template );
    viewModel.editor = new Quill('#editor', {
        modules: { toolbar: '#toolbar' },
        theme: 'snow'
    });
    viewModel.uploadArea = new ImageUploadArea( {
        previewAreaSelector: "#image-upload-preview",
        dragAndDropAreaSelector: "#image-upload-zone",
        debug: true,
        images: loadedImages
    } );

    ko.applyBindings( viewModel, this.contentEl );
}

function onBefore( done, params )
{
    console.log("[ArticleEditor] Enter view", params);
    event.broadcast("ChangeTitle", { title: "Artikel bearbeiten" });
    if( !security.getUserRole() )
    {
        swal("Fehler", "Sie sind nicht berechtigt diese Seite zu sehen.", "error").then( () => {
            this.router.navigate("/");
        });
        return done(false);
    }
    if( params && params.articleId )
    {
        viewModel.articleId( params.articleId );
        viewModel.isArticleUpdate( true );
        $.get(`${config.serverUrl}/articles/${params.articleId}`).then( response => {
            let { article } = response;
            viewModel.articleTitle( article.title );
            viewModel.articleContent( article.content );
            loadedImages = article.images;
            done();
        }).catch( err => {
            console.error( err );
            let translations = translater.translateKeys("general.error", "errors.unableToLoadArticle");
            swal( translations[0], translations[1], "error").then( () => {
                this.router.navigate("articles");
            });
            done(false);
        });
    }
    else // no article id given, open empty editor
    {
        done();
    }
}

function onLeave()
{
    console.log("[ArticleEditor] Left view");

}

function save()
{
    if( viewModel.isSendingRequest() ) return;
    console.log( "[ArticleEditor] Save content: ", viewModel.articleContent());
    var data = new FormData();
    data.append( "title", viewModel.articleTitle() );
    data.append( "content", viewModel.articleContent() );
    let { images } = viewModel.uploadArea;
    images.forEach( attachment => {
        if( attachment.status === "wantToUpload" && attachment.file && typeof attachment.file !== "string")
        {
            data.append( "images", attachment.file );
            attachment.file = attachment.file.name;
        }
        data.append( "imageMeta", JSON.stringify( attachment ) );
    });
    _sendRequest( data );
}

/**
 *  @param {FormData} formData 
 */
function _sendRequest( formData )
{
    console.log("[ArticleEditor] Sending data");
    viewModel.isSendingRequest( true );
    $.ajax({
        type: viewModel.isArticleUpdate() ? "PUT" : "POST",
        url: config.serverUrl + "/articles" + ( viewModel.isArticleUpdate() ? `/${viewModel.articleId()}` : "" ),
        cache: false,
        contentType: false,
        processData: false,
        data: formData,
        xhr: function()
        {
            let xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable)
                {  
                    viewModel.uploadProgress( Math.floor(evt.loaded / evt.total * 100) + "%" );
                }
            }, false); 
            return xhr;
        },
        success: result => {
            console.log("[ArticleEditor] Success on sending data: ", result);
            toastr.success("Artikel erfolgreich gespeichert.");
            viewModel.isSendingRequest( false );
            router.navigate( "/articles/" + viewModel.articleId() );
        },
        error: function(err){
            console.log("[ArticleEditor] Error on sending data: ", err);
            toastr.error("Artikel konnte nicht gespeichert werden.");
            viewModel.isSendingRequest( false );
        }
    });
}


module.exports = { paths, onActive, onBefore, onLeave };