const translato = require( "translato" );

/**
 *  @description Set the title of the page in register tab and the header area of the page.
 *  @param {string} title - Title to be shown, can be a translation key
 *  @param {boolean} isTranslationKey - If title is a translation key, set this to true
 *  @param {string} querySelector - Selector for title, default is: "#page-title"
 *  @returns {void}
 */
function changeTitle( title, isTranslationKey, querySelector )
{
    let _title = title;
    if( isTranslationKey )
    {
        _title = translato.translateKeys( _title );
    }
    let titleEl = document.querySelector("title");
    titleEl.innerText = _title;

    let pageTitleEl = document.querySelector( querySelector || "#page-title");
    pageTitleEl.style.transition = "transform 1s ease-in-out";
    pageTitleEl.style.transition = "font-size";
}

module.exports = { changeTitle };