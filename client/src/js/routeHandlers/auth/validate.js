const $ = require("jquery");
const translater = require("translato");
const config = require("../../config");
const swal = require("sweetalert");
const event = require("../../service/event");

const path = "validate/:token";

function onActive()
{
    console.log("[Validation] OnActive should not be called... cause view is never active.");
}

function onBefore( done, params )
{
    let { token } = params;
    console.log("[Validate] Token: ", token);
    event.broadcast("ChangeTitle", { title: "validation.title", isTranslationKey: true });
    $("#loading-message").text( translater.translateKeys("validation.loading") );    
    $.get( config.serverUrl + "/auth/validate/" + token ).then( () => {
        let translations = translater.translateKeys("general.success", "validation.success");
        this.contentEl.innerHTML = "";
        swal(translations[0], translations[1], "success").then( () => {
            this.router.navigate("login");
        });
        done( false );
    }).catch( err => {
        console.error("[Validation] Unable to validate account.", err);
        let translations = translater.translateKeys("general.error", "validation.error");
        this.contentEl.innerHTML = "";
        swal(translations[0], translations[1], "error").then( () => {
            this.router.navigate("/");
        });
        done( false );
    });
}

module.exports = { path, onActive, onBefore };