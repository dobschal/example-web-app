const ko = require("knockout");
const $ = require("jquery");

/** 
 *  Plugin for Quill editor and knockout js.
 *  Example:
 *      <div data-bind="foreach: items">
 *          <p data-bind="animation: 'fadeIn'">Hello World!</p>
 *      </div>
 *      viewModel = {
 *          items: ko.observableArray([])
 *      }
 *  
 */
ko.bindingHandlers.animation =
{
    preprocess: (value, name, addBindingCallback) =>
    {
        console.log("[animation.js] preprocess animation " + value);
        if( value.includes( "fadeIn" ) ) addBindingCallback("style", "{ display: 'none' }");
        if( value.includes( "fallIn" ) ) addBindingCallback("style", "{ 'transform': 'rotateX(90deg)', 'transform-origin': '0% 0%', 'transition': 'transform 3s' }");
        return value;
    },
    init: ( element, valueAccessor ) =>
    {
        console.log("[animation.js] init animation " + valueAccessor());
        if( valueAccessor().includes( "fadeIn" ) ) $(element).fadeIn();
        if( valueAccessor().includes( "fallIn" ) ) $(element).css({
            'transform': 'rotateX(0deg)'
        });
    }
};