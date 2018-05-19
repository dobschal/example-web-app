const $ = require("jquery");
const ko = require("knockout");

/**
 *  Is executed before each viewController is called...
 *  @param {object} params 
 */

module.exports = function( done, params )
{

    let token = window.localStorage.getItem("token");
    if( token )
    {
        $.ajaxSetup({
            headers: { 'Authorization': 'Bearer ' + token }
        });
    }

    ko.cleanNode(this.contentEl);
    ko.cleanNode(this.titleEl);

    this.titleEl.innerHTML = "";
    this.contentEl.innerHTML = `<div class="loading-spinner"></div>`;

    if( window.innerWidth < 768 )
    {
        $("#wrapper").removeClass("toggled");
    }

    done();
};