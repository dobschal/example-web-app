const $         = require("jquery");
const ko        = require("knockout");
const fs        = require('fs');
const config     = require("../../config");
const swal      = require("sweetalert");
const Quill     = require("quill");
const translater= require("translato");
const Sortable  = require("sortablejs");
const security  = require("../../service/security");
const event     = require("../../service/event");
const toastr    = require("toastr");

let paths        = [ "articles/editor", "articles/editor/:articleId" ];
let template    = fs.readFileSync(__dirname + "/../../../html/articles/editor.html", 'utf8');
let viewModel   = {
    title: ko.observable(""),
    editorContent: ko.observable(""),
    editor: null,
    save: save,
    attachedImages: [],
    uploadTotalSize: 0,
    isArticleUpdate: ko.observable(false), // else its a new article
    articleId: ko.observable("")
};
let imageUploadZone = null;
let imagePreview = null;
let sortableImagePreview = null;

function onActive( params, query )
{
    console.log("[ArticleEditor] View ready");
    
    this.titleEl.innerHTML = "Artikel Bearbeiten";
    this.contentEl.innerHTML = translater.translateHTML( template );

    viewModel.editor = new Quill('#editor', {
        modules: { toolbar: '#toolbar' },
        theme: 'snow'
    });

    ko.applyBindings( viewModel, this.contentEl );

    // setTimeout( () => {
    //     viewModel.editorContent("<b>Yes it works :)</b>");        
    //     translater.setLocale("en", true);
    // }, 3000);

    // FAKE API REQUEST ... get images...
    // setTimeout( () => {
    //     viewModel.attachedImages.push({
    //         file: "https://images.pexels.com/photos/594969/pexels-photo-594969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    //         status: "uploaded", // "wantToUpload", "wantToDelete",
    //         previewed: false,
    //         sortIndex: 0
    //     });
    //     _previewUploadImages();
    // }, 3000);

    _initImageUploadZone();
    _previewUploadImages();

    document.onkeypress = e => {
        if( e.keyCode === 100 )
        {
            console.log( "[ArticleEditor] ", viewModel );
        }
    };
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
            viewModel.title( article.title );
            viewModel.editorContent( article.content );
            viewModel.attachedImages = article.images.map( image => {
                image.previewed = false;
                return image;
            });
            viewModel.attachedImages.sort( (a, b) => {
                if( a.sortIndex < b.sortIndex ) return -1;
                if( a.sortIndex > b.sortIndex ) return 1;
                return 0;
            });
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
    else
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
    console.log( "[ArticleEditor] Save content: ", viewModel.editorContent());

    var data = new FormData();

    data.append( "title", viewModel.title() );
    data.append( "content", viewModel.editorContent() );

    viewModel.attachedImages.forEach( attachment => {
        if( attachment.status === "wantToUpload" && attachment.file && typeof attachment.file !== "string")
        {
            data.append( "images", attachment.file );
            attachment.file = attachment.file.name;
        }
        data.append( "imageMeta", JSON.stringify( attachment ) );
    });

    console.log("[ArticleEditor] Sending data");

    $.ajax({

        //  If this is an update request, we will use 
        //  the HTTP method PUT instead of POST
        type: viewModel.isArticleUpdate() ? "PUT" : "POST",

        //  If articleId is given, add it to the url
        url: config.serverUrl + "/articles" + ( viewModel.isArticleUpdate() ? `/${viewModel.articleId()}` : "" ),
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        success: function(result) {
            console.log("[ArticleEditor] Success on sending data: ", result);
            toastr.success("Artikel erfolgreich gespeichert.");
        },
        error: function(err){
            console.log("[ArticleEditor] Error on sending data: ", err);
            toastr.error("Artikel konnte nicht gespeichert werden.");
        }
    });


}

// --- FILE UPLOAD ---

function _initImageUploadZone()
{
    console.log("[ArticleEditor] Initialized upload zone.");
    
    imageUploadZone = document.getElementById('image-upload-zone'); 
    imagePreview = document.getElementById('image-upload-preview');  

    imageUploadZone.addEventListener('drop', _handleFileDropEvent, false);
    imageUploadZone.addEventListener('dragover', event => {
        event.preventDefault();
        console.log("[ArticleEditor] Drag over upload zone.");
        $(imageUploadZone).addClass("dragover");
    }, false);
    imageUploadZone.addEventListener('dragleave', event => {
        event.preventDefault();
        console.log("[ArticleEditor] Drag leave upload zone.");
        $(imageUploadZone).removeClass("dragover");
    }, false);    
    sortableImagePreview = Sortable.create(imagePreview, {
        animation: 300,
        onSort: () => {
            _updateImageSorting();
        }
    });  
}

function _handleFileDropEvent(event)
{
    console.log("[ArticleEditor] Dropped files...");

    $(imageUploadZone).removeClass("dragover");

    event.stopPropagation();
    event.preventDefault();
 
    for (var i = 0; i < event.dataTransfer.files.length; i++)
    {        
        viewModel.attachedImages.push({
            file: event.dataTransfer.files[i],
            status: "wantToUpload", // "uploaded", "wantToDelete",
            previewed: false,
            sortIndex: viewModel.attachedImages.length
        });
        viewModel.uploadTotalSize += event.dataTransfer.files[i].size;  // Hinzufügen der Dateigröße zur Gesamtgröße
    }

    _previewUploadImages();    
}

function _appendImage( imageSrc, id )
{
    let removeButtonEl = document.createElement("button");
    let listEl = document.createElement("li");
    let imageEl = document.createElement("img");

    removeButtonEl.className = "btn btn-link btn-sm";
    removeButtonEl.innerHTML = `<i class="fa fa-trash"></i>`;
    removeButtonEl.onclick = e => {
        e.preventDefault();
        viewModel.attachedImages.map( attachment => {
            let { file } = attachment;
            let filename = typeof file === "string" ? file : file.name;
            if( id === filename )
            {
                attachment.status = "wantToDelete";
                listEl.style.opacity = "0.5";
            }
            return attachment;
        });
    };
    
    imageEl.src = imageSrc;
        
    listEl.setAttribute( "data-id", id );
    listEl.appendChild( imageEl );
    listEl.appendChild( removeButtonEl );

    imagePreview.appendChild( listEl );
}

function _previewUploadImages()
{
    console.log("[ArticleEditor] Preview images.");
    if (FileReader)
    {
        viewModel.attachedImages.forEach( image => {
            let { file, previewed } = image;
            if( previewed ) return;
            image.previewed = true;
            if( typeof file === "string" ) // it's an URL and so the image is already uploaded
            {
                _appendImage( file, file );
            }
            else
            {
                let fileReader = new FileReader();
                fileReader.onload = () =>
                {
                    _appendImage( fileReader.result, file.name );
                };
                fileReader.readAsDataURL( file );
            }            
        });
    }
}

function _updateImageSorting()
{
    let currentOrder = sortableImagePreview.toArray();
    console.log("[ArticleEditor] Image order: ", currentOrder);
    viewModel.attachedImages.map( attachment => {
        let { file } = attachment;
        let filename = typeof file === "string" ? file : file.name;
        let sortIndex = currentOrder.indexOf( filename );
        attachment.sortIndex = sortIndex;
        return attachment;
    });
    viewModel.attachedImages.sort( (a, b) => {
        if( a.sortIndex < b.sortIndex ) return -1;
        if( a.sortIndex > b.sortIndex ) return 1;
        return 0;
    });
    console.log("[ArticleEditor] Images: ", viewModel.attachedImages);
}

module.exports = { paths, onActive, onBefore, onLeave };