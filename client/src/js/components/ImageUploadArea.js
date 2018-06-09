const $ = require("jquery");
const Sortable  = require("sortablejs");

class ImageUploadArea
{
    constructor( config )
    {
        let { previewAreaSelector, dragAndDropAreaSelector, debug, images } = config;

        this.debug = debug;
        this.imageUploadZone = document.querySelector( dragAndDropAreaSelector );
        this.imagePreview = document.querySelector( previewAreaSelector );        
        this.sortable = null;

        if( Array.isArray( images ))
        {
            this.images = images.map( image => {
                image.previewed = false;
                return image;
            });
            this.images.sort( (a, b) => {
                if( a.sortIndex < b.sortIndex ) return -1;
                if( a.sortIndex > b.sortIndex ) return 1;
                return 0;
            });            
        }
        else
        {
            this.images = [];
        }

        this._init();
    }

    _log()
    {
        if( this.debug ) console.log( JSON.stringify( arguments ) );
    }
    
    _init()
    {
        this._log("[ImageUploadArea] Initialized upload zone.");

        this.imageUploadZone.addEventListener('drop', this._handleFileDropEvent.bind(this), false);
        this.imageUploadZone.addEventListener('dragover', event => {
            event.preventDefault();
            this._log("[ImageUploadArea] Drag over upload zone.");
            $(this.imageUploadZone).addClass("dragover");
        }, false);
        this.imageUploadZone.addEventListener('dragleave', event => {
            event.preventDefault();
            this._log("[ImageUploadArea] Drag leave upload zone.");
            $(this.imageUploadZone).removeClass("dragover");
        }, false);    
        this.sortable = Sortable.create(this.imagePreview, {
            animation: 300,
            onSort: () => {
                this._updateImageSorting();
            }
        });  
        this._previewUploadImages();
    }

    _handleFileDropEvent( event )
    {
        this._log("[ImageUplaodArea] Dropped files...");

        $(this.imageUploadZone).removeClass("dragover");

        event.stopPropagation();
        event.preventDefault();
    
        for (var i = 0; i < event.dataTransfer.files.length; i++)
        {        
            this.images.push({
                file: event.dataTransfer.files[i],
                status: "wantToUpload", // "uploaded", "wantToDelete",
                previewed: false,
                sortIndex: this.images.length
            });
        }

        this._previewUploadImages();
    }

    _updateImageSorting()
    {
        let currentOrder = this.sortable.toArray();
        this._log("[ImageUploadArea] Image order: ", currentOrder);
        this.images.map( image => {
            let { file } = image;
            let filename = typeof file === "string" ? file : file.name;
            let sortIndex = currentOrder.indexOf( filename );
            image.sortIndex = sortIndex;
            return image;
        });
        this.images.sort( (a, b) => {
            if( a.sortIndex < b.sortIndex ) return -1;
            if( a.sortIndex > b.sortIndex ) return 1;
            return 0;
        });
        this._log("[ImageUploadArea] Images: ", this.images);
    }

    _previewUploadImages()
    {
        this._log("[ImageUploadArea] Preview images.");
        if (FileReader)
        {
            this.images.forEach( image => {
                let { file, previewed } = image;
                if( previewed ) return;
                image.previewed = true;
                if( typeof file === "string" ) // it's an URL and so the image is already uploaded
                {
                    this._appendImage( file, file );
                }
                else
                {
                    let fileReader = new FileReader();
                    fileReader.onload = () =>
                    {
                        this._appendImage( fileReader.result, file.name );
                    };
                    fileReader.readAsDataURL( file );
                }            
            });
        }
    }
        
    _appendImage( imageSrc, id )
    {
        let { removeButtonEl, listEl, imageEl } = ImageUploadArea.createThumbnailElements();

        removeButtonEl.className = "btn btn-link btn-sm";
        removeButtonEl.innerHTML = `<i class="fa fa-trash"></i>`;
        removeButtonEl.onclick = e => {
            e.preventDefault();
            this.images.map( attachment => {
                let { file } = attachment;
                let filename = typeof file === "string" ? file : file.name;
                if( id === filename )
                {
                    attachment.status = "wantToDelete";
                    // listEl.style.opacity = "0.5";
                    $(listEl).fadeOut();
                }
                return attachment;
            });
        };
        
        imageEl.src = imageSrc;
            
        listEl.setAttribute( "data-id", id );
        listEl.appendChild( imageEl );
        listEl.appendChild( removeButtonEl );

        this.imagePreview.appendChild( listEl );
    }

    static createThumbnailElements()
    {
        let removeButtonEl = document.createElement("button");
        let listEl = document.createElement("li");
        let imageEl = document.createElement("img");
        return { removeButtonEl, listEl, imageEl };
    }
}

module.exports = ImageUploadArea;