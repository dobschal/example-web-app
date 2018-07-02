# Example WebApp

`Modern fullstack HTML5 web app with NodeJS.`

## Content

### Client
* nodejs
    - npm init
    - npm install
* gulp --> https://gulpjs.com
    - browserify
    - eslint
    - scss
        - bootstrap
            - sidebar
        - font-awesome
            - burger button
        - loading-spinner
        - !flex-box
    - copy
* navigojs
    - router
        - viewController
        - hookHandler
* knockoutjs
    - show data
* templates via browserif + brfs
* TextEditor --> Quill
* Image Upload
* Offline Available
* !Limit response size GET /articles?limit=100 or /articles?from=2018-07-04&to=now
* !Infinity Scroll
* Cache data in local storage
* Generate random data
* socket connection + Comments on articles
* translato
* animations
* MomentJS
* !Streams
* Cubic Bezier --> http://cubic-bezier.com/#.19,.74,.83,.67
* Drag and Drop Files
* Bootstrap Themes
* Font Awesome fa-spin
* !Chart JS
* !Todo Lists
* Lightbox
* fadeIn image after load --> image knockout binding
* !Datenschutz DSGVO
* Form Validation - parsleyjs

* !Favicon

#### Fullscreen iOS App
It is possible to attach an WebApp to the iOS home screen and open that webapp in fullscreen format.
This gives it the feeling of an native app. All we need to add is the manifest.json.
http://blog.dialogic.com/blog/progressive-web-apps-full-screen

#### Swipe Gestures
We want to detect swipe gestures of the user to perform some actions. In our case, we toggle the sidebar if the user swipes to left or right.
To detect swipe gestures we use HammerJS in the MainController.
https://hammerjs.github.io

We only want swipe gestures on mobile devices. Else on desktop computer the gesture would overwrite the text selection functionality, but we want both. So in the mainController we apply HammerJS only if the current device is mobile. See the following link for details, how to detect a mobile device:
https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

* !Google Maps
* !Active Menu Item
* Labels --> https://stackoverflow.com/questions/18432376/what-does-for-attribute-do-in-html-label-tag
* Linting - HTML, JS
* Auto Require all files in folder
* Copy and paste files

### Server

* express app
#### Autoloader

In the app.js, our entry script, we do not want to add every single script we created manually. Instead we write an autoloader for all routes and socketListeners.
```javascript
fs.readdirSync( __dirname + "/routes" )
    .forEach( filename => {
        app.use("/", require( __dirname + "/routes/" + filename 
    })
);
```

#### CRUD routes

*CRUD* > Create, Retrieve, Update, Delete

Normally we need this four actions for every entity availabel over our API. Use different HTTP methods for each: GET, POST, PUT, DELETE. 

#### mongoose
Moongoose is a nice database manager to setup your models and to communicate with the mongoDB.
We can easily define models and create instance which we can save in our mongoDB. Also querying the database is much easier with mongoose.

```javascript
const mongoose = require("mongoose");

var articleSchema = mongoose.Schema({
    content: { type: String, required: true }
});

var Article = mongoose.model('Article', articleSchema)

var article = new Article({ title: "test", content: "This is my content!" });

article.save( err => {
    if(err) throw err;
    console.log("Saved article in database...");
})

Article.findOne({ title: "test" }, (err, articleFromDB) => {
    if(err) throw err;
    console.log("Here is my article from the database: ", articleFromDB);
});
```

#### JWT
Javascript Web Tokens are used to keep information about the user on the users computer/browser.
When the user authenticates with username and password, the server creates a token with a signature.
Only the server can validate the token, cause it includes a hashed secret key. 
Every request sent by the user then includes that token in the authorization header.
If the token is not valid or no token is given, the server will respond with an 401 error code.

##### Server
```javascript
// The service "security" contains a middleware method to secure a route.
// If the user hasn't the right user role a error response will be send
router.post('/articles', security.protect(["user"]), function(req, res, next) { 
    ...
})
```

**Notice: We need to inform the user about storing data on their computer! We are not using cookies, but still we need to tell the user that we store data in the localStorage!**


#### Sockets

The server side of our websocket interface is setup in the app.js file. 
If you want to listen for an event sent from the client, just add an script to folder "socketListeners".
The script should export an name (string name of the event the client fires) and a listener (function which is excuted when event was triggered).
The listener got the current connection to the client and the socket io instance as binded properties.

```javascript
const name = "SomeEventNamehere";

function listener( data )
{
    this.connection.emit( "SpecialAnswer", "Send something to the client, who triggered the event.");
    
    this.io.emit("HelloWorld", "Send something to all connected users!");
}

module.exports = { name, listener };
```

#### DBMigration
You can add scripts to the folder 'dbMigration'. Each is executed one time. So if you make changes in your model, add a update script for the database. It will be started automatically, when node starts!

#### Image Upload
We are using Multer to apply a middleware to a route that can handle file uploads.
See "routes/articles.js" for more details.
In the folder "uploadHandlers" we can define specific uploadHandlers. The uploadHandlers can limit and filter the uploaded files and decide where to store the files. I.e. we have an articleImage uploadHandler.

https://github.com/expressjs/multer

#### Environment Variables
In our case environment variables are used to keep secret parameters secret. 
Instead of putting them into any config file and pushing them into the git repository, we use the node cmd line syntax:
```bash
--DB_PATH=mongodb://blabla.whatever node app.js
```
In our server application we can access this variables as follows:
```javascript
let dbPath = process.env.DB_PATH;
```
Normally we have multiple environment variables like e-mail, database, push notifiction credentials or whatever. That's why it makes sense to put them in a secret file. The NPM package *'dotenv'* makes it possible. Just store the parameters in a file call *'.env'* in the root of the application and add the following line to your app:
```javascript
require('dotenv').config();
```
**Notice: Add the .env file to your git ignore!!! And upload it manually to your server, when needed.**


#### Push Notifications

We are using the NPM package *'web-push'* for that.

* E-Mail Templates
* !CRON Jobs
* Auto Deploy on Repository Change
* !Locale header to send e-mails in right language
* !Super Admin - Page
* nginx server setup with ssl
