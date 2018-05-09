/**
 *  Slim ES6 library with offen needed javascript functionality.
 *  @author Sascha Dobschal, 2018
 */

let connectionAvailable = true;

class Util {

    /**
     *  Add and register service worker script file.
     *  @param {string} filename 
     */
    static addServiceWorker( filename )
    {
        if ('serviceWorker' in navigator)
        {
            navigator.serviceWorker
            .register( filename, { scope: './' })
            .then(function(registration) {
                console.log("[Emmo] Service Worker Registered");
            })
            .catch(function(err) {
                console.error("[Emmo] Service Worker Failed to Register", err);
            })
        }
    };

    /**
     *  @param {string} eventName 
     */
    static on( eventName, callback ) 
    {
        switch(eventName)
        {
            case "connectionChanged": 
                setInterval( () => {
                    if(navigator.onLine && !connectionAvailable)
                    {
                        connectionAvailable = true;
                        console.log("[Emmo] Internet connection available.");
                        callback( true );
                    }
                    else if(!navigator.onLine && connectionAvailable)
                    {
                        connectionAvailable = false;
                        console.log("[Emmo] Lost internet connection!");
                        callback( false );
                    }
                }, 1000 );
            break;
            case "loaded": 
                document.addEventListener("DOMContentLoaded", event => {
                    callback( event );
                });
            break;
            default: console.error(`[Emmo] Unknown eventName "${eventName}".`);
        }
    };

    /**
     *  HTTP Get request...
     *  @param {string} url 
     */
    static get(url) 
    {
        return new Promise( (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE)
                {
                    if (xhr.status === 200)
                    {
                        var result = xhr.responseText
                        result = JSON.parse(result);
                        resolve(result);
                    }
                    else
                    {
                        reject(xhr);
                    }
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        }); 
    };

    static post( url, data, headers )
    {

    }
}

module.exports = Util;