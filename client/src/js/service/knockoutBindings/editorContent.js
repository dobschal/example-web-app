const ko = require("knockout");
const Quill = require("quill");

/** 
 *  Plugin for Quill editor and knockout js.
 *  Example:
 *      <div id="editor" data-bind="editorContent: { value: editorContent, editor: editor }">
 *          <p>Hello World!</p>
 *      </div>
 *      viewModel = {
 *          editor: new Quill( ... ),
 *          editorContent: ko.observable("")
 *      }
 *  
 */
ko.bindingHandlers.editorContent =
{
    init: ( element, valueAccessor ) =>
    {
        if( !valueAccessor().editor || !(valueAccessor().editor instanceof Quill) )
        {
            throw new Error("[knockout-editor.js] Property editor of viewModel needs to be an instance of Quill.");
        }
    valueAccessor().editor.on('text-change', () => {
            valueAccessor().value( valueAccessor().editor.root.innerHTML );
        });
    },
    update: (element, valueAccessor ) =>
    {
        if( valueAccessor().value() !== valueAccessor().editor.root.innerHTML )
        {
            valueAccessor().editor.clipboard.dangerouslyPasteHTML( valueAccessor().value(), "silent" );
        }
    }
};