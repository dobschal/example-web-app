/**
 *  @author Sascha Dobschal
 *  @license MIT
 */

//  Support CommonJS, global and AMD
(function(name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();
}('translato', function() {

    let _dictionary = null;
    let _locale = "de";
    let _listeners = [];

    /**
     *  @description Listen for events of the translater.
     *  @param {string} eventName 
     *  @param {function} callback 
     */
    function on( eventName, callback )
    {
        let events = ["languageChanged"];
        if( !events.includes( eventName ) ) throw new Error(`[translater.js] Translater has no event named '${eventName}'.`);
        _listeners.push({ eventName, callback });
    }

    /**
     *  @description Set the global localization key for the webapp.
     *  @param {string} locale - "de", "en"
     *  @param {boolean} refreshPage - calls translater.translatePage() if true
     *  @returns {void}
     */
    function setLocale( locale, refreshPage )
    { 
        _locale = locale;
        
        if( refreshPage ) translatePage();

        _listeners.forEach( listener => {
            if( listener.eventName === "languageChanged" ) listener.callback();
        });
    }

    /**
     * @description Set dictionary with translations.
     * @param {object} dictionary 
     */
    function setDictionary( dictionary )
    {
        _dictionary = dictionary;
    }

    /**
     *  @description Translate the passed html string.
     *  @param {string} htmlString - like "<div data-tl="title"></div>"
     *  @returns {jQueryNode}
     */
    function translateHTML( htmlString )
    {
        let parent = document.createElement("div");
        parent.innerHTML = htmlString;        
        parent.querySelectorAll("[data-tl]").forEach( element => {
            let translationKey = element.getAttribute("data-tl");
            let translation = translateKeys(translationKey);
            element.innerHTML = translation;
        });
        return parent.innerHTML;
    }

    /**
     *  @description Translate passed keys. You can pass multiple key parameters, 
     *               this will return an array of the translated values.
     *  @param {string} - keys of translation
     *  @returns {string|array}
     */
    function translateKeys( /* keys... */ )
    {        
        var args = typeof arguments[0] === "string" ? arguments : arguments[0];
        var items = [];
        var item, key, translationKeys, i, j;
        for(i = 0; i < args.length; i++)
        {
            key = args[i];
            translationKeys = key.split(".");
            item = _getDictionaryItem(translationKeys);
            items.push(item[ _locale ]);
        }
        if(items.length === 1)
        {
            return items[0];
        }
        return items;
    };

    /**
     *  @description Looks up the current viewed DOM for elements with the 
     *               attribute data-tl or data-tl and inserts the translated key.
     *  @returns {number} - amount of translated elements
     */
    function translatePage()
    {
        var that = this;
        let amountOfTranslations = 0;
        let elements = document.querySelectorAll("[data-tl]")
        elements.forEach( element => {        
            let translationKey = element.getAttribute("data-tl");
            let translation = translateKeys(translationKey);
            element.innerHTML = translation;
            amountOfTranslations++;
        });
        return amountOfTranslations;
    };

    /**
     * @description Get the translation value for a key from the dictionary.
     * @param {any} translationKeys 
     * @returns 
     */
    function _getDictionaryItem(translationKeys)
    {
        var item = _dictionary[translationKeys.shift()];
        if(!item) return translationKeys.join(".");
        for(j = 0; j < translationKeys.length; j++)
        {
            if(!item.hasOwnProperty(translationKeys[j])) return translationKeys.join(".");
            item = item[translationKeys[j]];
        }
        return item;
    }

    return { translateHTML, translatePage, translateKeys, setLocale, setDictionary, on };
}));
