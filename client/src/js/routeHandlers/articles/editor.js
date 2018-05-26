const $         = require("jquery");
const ko        = require("knockout");
const fs        = require('fs');
const config     = require("../../config");
const swal      = require("sweetalert");
const Quill     = require("quill");
const translater= require("translato");
const Sortable  = require("sortablejs");

let path        = "articles/editor";
let template    = fs.readFileSync(__dirname + "/../../../html/articles/editor.html", 'utf8');
let viewModel   = {
    title: ko.observable(""),
    editorContent: ko.observable(""),
    editor: null,
    save: save,
    attachedImages: [],
    uploadTotalSize: 0
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

    setTimeout( () => {
        viewModel.editorContent("<b>Yes it works :)</b>");        
        translater.setLocale("en", true);
    }, 3000);

    // FAKE API REQUEST ... get images...
    setTimeout( () => {
        viewModel.attachedImages.push({
            file: "https://images.pexels.com/photos/594969/pexels-photo-594969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
            status: "uploaded", // "wantToUpload", "wantToDelete",
            previewed: false,
            sortIndex: 0
        });
        _previewUploadImages();
    }, 3000);

    _initImageUploadZone();

}

function onBefore( done, params )
{
    $("title").text("Article");
    console.log("[ArticleEditor] Enter view");
    done();
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
            data.append( "image", attachment.file );
            attachment.file = attachment.file.name;
        }
        data.append( "imageMeta", JSON.stringify( attachment ) );
    });

    console.log("[ArticleEditor] Sending data");

    $.ajax({
        type: 'POST',
        url: config.serverUrl + "/articles",
        cache: false,
        contentType: false,
        processData: false,
        data: data,
        success: function(result){
            console.log("[ArticleEditor] Success on sending data: ", result);
        },
        error: function(err){
            console.log("[ArticleEditor] Error on sending data: ", err);
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
        animation: 300
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
            sortIndex: 0
        });
        viewModel.uploadTotalSize += event.dataTransfer.files[i].size;  // Hinzufügen der Dateigröße zur Gesamtgröße
    }

    _previewUploadImages();    
}

function _appendImage( imageSrc )
{
    let imageEl = document.createElement("img");
    imageEl.src = imageSrc;
    let listEl = document.createElement("li");
    listEl.appendChild( imageEl );
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
                _appendImage( file );
            }
            else
            {
                let fileReader = new FileReader();
                fileReader.onload = () =>
                {
                    _appendImage( fileReader.result );
                };
                fileReader.readAsDataURL( file );
            }            
        });
    }
}

module.exports = { path, onActive, onBefore, onLeave };