const event = require("../../service/event");
const fs = require("fs");
const loadGoogleMapsApi = require('load-google-maps-api')
const toastr = require("toastr");
const translato = require("translato");

let template    = fs.readFileSync( __dirname + "/../../../html/map.html", 'utf8' );
let paths = ["map"];
let googleMaps = null;

function onActive( params )
{
    console.log("[MapView] Is active. Parameter:  ", params);
    this.contentEl.innerHTML = template;
}

function onBefore( done, params )
{
    event.broadcast("ChangeTitle", { title: "map.title", isTranslationKey: true });
    console.log("[MapView] Is before active. Parameter:  ", params);
    loadGoogleMapsApi( /* TODO: ADD CONFIG HERE */ ).then(function (googleMaps_) {
        googleMaps = googleMaps_;
        // new googleMaps.Map(document.querySelector('.map'), {
        //     center: {
        //         lat: 40.7484405,
        //         lng: -73.9944191
        //     },
        //     zoom: 12
        // });
        done();
    }).catch(function (error) {
        console.error("[MapView] Unable to load map...", error);
        toastr.error( translato.translateKeys("map.error.load") );
        done(false);
    });    
}

module.exports = { onActive, onBefore, paths };