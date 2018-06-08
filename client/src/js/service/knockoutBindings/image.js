const ko = require("knockout");

ko.bindingHandlers.image =
{
    init: ( element, valueAccessor ) =>
    {
        let { src, width, height } = valueAccessor();
        let downloadingImage = new Image();
        if( width ) element.style.width = width;
        if( height ) element.style.height = height;
        downloadingImage.onload = () =>
        {
            element.style.opacity = "0.0";
            element.src = downloadingImage.src;
            setTimeout(() => {
                element.style.transition = "opacity 0.5s ease-in-out";
                element.style.opacity = "1.0";
            }, 300);
        };               
        downloadingImage.src = src;
    }
};