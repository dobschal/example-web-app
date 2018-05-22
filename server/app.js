const express       = require('express');
const path          = require('path');
const favicon       = require('serve-favicon');
const logger        = require('morgan');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const fs            = require("fs");
const mongoose      = require("mongoose");
const cors          = require('cors');
const config         = require("./config.json");
const mm            = require("mongodb-migrations");

//  Get database connection and execute db migration scripts
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', () => { 
    console.log("[app.js] Successfully connected to database.");
    var migrator = new mm.Migrator({ url: config.dbPath });
    migrator.runFromDir(path.join(__dirname, "dbMigration"), (err, result) => {
        if (err) throw new Error("[app.js] Error while database migration: " + err.message);
    });
});

mongoose.connect( config.dbPath );

//  Configure express app
var app = express();
    app.use(cors());
    app.use(logger('dev'));
    app.use("/uploads", express.static( __dirname + "/uploads" ));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

const http          = require('http').Server(app);
const io            = require('socket.io')(http);

//  Get all route handlers
fs.readdirSync( __dirname + "/routes" ).forEach( filename => {
    const routeHandler = require( __dirname + "/routes/" + filename );
    app.use("/", routeHandler( io ));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send( err );
});

//  Get all websocket listener scripts
let socketListeners = [];
fs.readdirSync( __dirname + "/socketListeners" ).forEach( filename => {
    const socketListener = require( __dirname + "/socketListeners/" + filename );
    socketListeners.push( socketListener );
});

//  On new connection from client, attach listeners
io.on('connection', function( connection ) {
    socketListeners.forEach( socketListener => {
        connection.on( 
            socketListener.name, 
            socketListener.listener.bind({
                io, connection
            })
        );
    });
});

// TODO: put port into environment variables
http.listen(3000, function(){
  console.log('[app.js] Listen to port 3000');
});