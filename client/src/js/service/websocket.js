const io = require("socket.io-client");
const config = require("../config");

let socketConnection = null;

const connectionOptions =
{
    "force new connection": true,
    "reconnectionAttempts": "Infinity",
    "timeout": 10000,
    "transports": [ "websocket" ]
};

function connect()
{
    return new Promise( ( resolve, reject ) => {

        if( socketConnection ) return resolve( socketConnection );

        socketConnection = io.connect( config.serverUrl, connectionOptions );

        socketConnection.on("connect", function( data ) {
            console.log("[websocket.js] Connected");
            resolve( socketConnection );
        });

        socketConnection.on("connect_error", function( error )
        {
            console.error("[websocket.js] Error while connecting.", error);
            reject(error);
        });

        socketConnection.on("error", function( error )
        {
            console.error("[websocket.js] Error", error);
            reject(error);
        });
    });
}

module.exports = { connect };