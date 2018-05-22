const express           = require('express');
const Article           = require("../models/Article");
const ArticleComment    = require("../models/ArticleComment");
const security          = require("../services/security");
const uploader          = require("../uploadHandlers/articleImage");

const router  = express.Router();

module.exports = function ( io ) {

    router.get('/articles/:articleId/comments', function(req, res, next) {
        const { articleId } = req.params;
        ArticleComment.find({ "articleId": articleId },( err, articleComments ) => {
            if (err) return next( err );
            res.send({ success: true, info: "Got article comments from database.", articleComments });
        });
    });

    router.post('/articles/:articleId/comment', security.protect(["user"]), function(req, res, next) {
        const { content } = req.body;
        const { articleId } = req.params;
        const { username } = req.tokenData;
        var myArticleComment = new ArticleComment({ articleId, content, username, modifiedAt: new Date() });
        myArticleComment.save((err, myArticleComment) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved article comment in database.", articleComment: myArticleComment });
            io.emit( "NewComment", myArticleComment );
        });
    });

    router.post('/articles', security.protect(["user"]), uploader.single("image"), function(req, res, next) {
        console.log("[articles.js] Got new uploaded file.", req.file);
        const { path:imagePath } = req.file;
        const { title, content } = req.body;
        var myArticle = new Article({ title: title, content: content, modifiedAt: new Date(), image: imagePath });
        myArticle.save((err, myArticle) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved article in database.", article: myArticle });
        });
    });

    router.get('/articles', function(req, res, next) {
        console.log("Hello World");
        const protocoll = req.connection.encrypted ? "https" : "http";
        Article.find(( err, articles ) => {
            if (err) return next( err );            
            articles = articles.map( item => {

                /**
                 *  Check if it is a relative or absolute URL. If relative add
                 *  the current host and protocoll to the URL string.
                 ** /uploads/filename.jpg --> http://yourdomain.de/uploads/filename.jpg
                 */
                if( !item.image.includes("http://") && !item.image.includes("https://") )
                {
                    item.image = protocoll + "://" + req.headers.host + "/" + item.image;
                }
                return item;
            });
            articles.sort( (a,b) => {
                if(a.modifiedAt.getTime() < b.modifiedAt.getTime() ) return -1;
                if(a.modifiedAt.getTime() > b.modifiedAt.getTime() ) return 1;
                return 0;
            });       
            console.log( "Hello", articles );     
            res.send({ success: true, info: "Got articles from database.", articles });
        });
    });

    router.get('/articles/:id', function(req, res, next) {
        const articleId = req.params.id;
        const protocoll = req.connection.encrypted ? "https" : "http";
        Article.findById( articleId, ( err, article ) => {
            if (err) return next( err );
            if( !article )
            {
                var error = new Error("Not found.");
                error.status = 404;
                return next( error );
            }
            /**
             *  Check if it is a relative or absolute URL. If relative add
             *  the current host and protocoll to the URL string.
             ** /uploads/filename.jpg --> http://yourdomain.de/uploads/filename.jpg
             */
            if( !article.image.includes("http://") && !article.image.includes("https://") )
            {
                article.image = protocoll + "://" + req.headers.host + "/" + article.image;
            }
            res.send({ success: true, info: "Got article from database.", article });
        });
    });

    router.put("/articles/:id", security.protect(["user"]), function( req, res, next ) {
        const articleId = req.params.id;
        req.body.modifiedAt = new Date();
        Article.findByIdAndUpdate( articleId, req.body, {new: true}, ( err, updatedArticle ) => {
            if (err) return next(err);
            res.send({ success: true, article: updatedArticle });
        });
    });

    return router;
}
