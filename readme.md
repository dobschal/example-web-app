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
* Swiper --> HammerJS to toggle Sidebar
* !Google Maps
* !Active Menu Item
* Labels --> https://stackoverflow.com/questions/18432376/what-does-for-attribute-do-in-html-label-tag
* Linting - HTML, JS
* Auto Require all files in folder
* Copy and paste files

### Server

* express app
* autoloader
* CRUD routes
* mongoose

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


* Sockets
* DBMigration
* Image Upload
* Environment Variables
* !Push Notifications
* E-Mail Templates
* !CRON Jobs
* !Fav icon
* Auto Deploy on Repository Change
* Locale header to send e-mails in right language
