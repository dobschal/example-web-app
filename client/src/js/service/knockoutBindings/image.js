const ko = require("knockout");

// TODO: remove this, use normal lightbox2 !!!

ko.bindingHandlers.image =
{
    init: ( element, valueAccessor ) =>
    {
        let { url, width, height, useLightbox } = valueAccessor();
        let downloadingImage = new Image();
        if( width ) element.style.width = width;
        if( height ) element.style.height = height;        
        if( useLightbox )
        {
            element.style.cursor = "pointer";
            element.onclick = () => {
                let lightboxEl = document.createElement("div");
                lightboxEl.className = "lightbox";
                let innerEl = document.createElement("div");
                innerEl.className = "inner";
                lightboxEl.appendChild( innerEl );
                innerEl.style.backgroundImage = `url('${url}')`;
                document.querySelector("body").appendChild(lightboxEl);
                lightboxEl.onclick = () => {
                    lightboxEl.parentNode.removeChild(lightboxEl);
                };
            };
        }        
        switch(element.tagName.toLowerCase())
        {
            case "div": 
                element.innerHTML = `<div class="in-progress"></div>`;
                element.style.overflow = "hidden";
                downloadingImage.onload = () =>
                {
                    element.innerHTML = "";   
                    element.style.opacity = "0.0";
                    element.style.backgroundImage = `url('${url}')`;
                    element.style.backgroundPosition = `50% 50%`;
                    element.style.backgroundRepeat = `no-repeat`;
                    element.style.backgroundSize = `cover`;
                    setTimeout(() => {
                        element.style.transition = "opacity 0.5s ease-in-out";
                        element.style.opacity = "1.0";
                    }, 300);
                };
                break;
            case "img": 
                downloadingImage.onload = () =>
                {
                    element.style.opacity = "0.0";
                    element.src = downloadingImage.src;
                    setTimeout(() => {
                        element.style.transition = "opacity 0.5s ease-in-out";
                        element.style.opacity = "1.0";
                    }, 300);
                };
                break;
            default: console.error("[KO-ImageBinding] KO image binding element needs to be a div or img tag.");
        }        
        downloadingImage.src = url;
    }
};