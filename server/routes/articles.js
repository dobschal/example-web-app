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

    router.post('/articles', security.protect(["user"]), uploader.array("image", 100), function(req, res, next) {
        console.log("[articles.js] Got new uploaded file.", req.files, req.body);
        let { title, content, imageMeta } = req.body;
        let images = [];
        imageMeta.forEach( metaInfoString => {
            let metaInfoObject = JSON.parse( metaInfoString );
            let { status, file, sortIndex } = metaInfoObject;            
            if( typeof status === "string" && status.toLowerCase() === "wanttoupload" )
            {                
                let uploadedFileInfo = req.files.find( uploadedFile => {
                    return uploadedFile.originalname === file;
                });
                if( uploadedFileInfo )
                {
                    let { path } = uploadedFileInfo;
                    let articleImage = {
                        file: path,
                        status: "uploaded",
                        sortIndex: sortIndex,
                        modifiedAt: new Date()
                    };
                    images.push( articleImage );
                }
            }
        });
        let myArticle = new Article({ title: title, content: content, modifiedAt: new Date(), images: images });
        myArticle.save((err, storedArticle) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved article in database.", article: storedArticle });
        });
    });

    router.get('/articles', function(req, res, next) {
        const protocoll = req.connection.encrypted ? "https" : "http";
        Article.find(( err, articlesFromDB ) => {
            if (err) return next( err );            
            let articles = articlesFromDB.map( article => {

                article.images.sort( (a,b) => {
                    if(a.sortIndex < b.sortIndex ) return -1;
                    if(a.sortIndex > b.sortIndex ) return 1;
                    return 0;
                } );

                /**
                 *  Check if it is a relative or absolute URL. If relative add
                 *  the current host and protocoll to the URL string.
                 ** /uploads/filename.jpg --> http://yourdomain.de/uploads/filename.jpg
                 */
                article.images = article.images.map( imageFromDB => {
                    if( !imageFromDB.file.includes("http://") && !imageFromDB.file.includes("https://") )
                    {
                        imageFromDB.file =  protocoll + "://" + req.headers.host + "/" + imageFromDB.file;
                    }
                    return imageFromDB;
                });
                return article;
            });

            articles.sort( (a,b) => {
                if(a.modifiedAt.getTime() < b.modifiedAt.getTime() ) return -1;
                if(a.modifiedAt.getTime() > b.modifiedAt.getTime() ) return 1;
                return 0;
            });
            
            console.log( "[articles.js] Got articles: ", articles );
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
            article.images = article.images.map( image => {
                if( !image.file.includes("http://") && !image.file.includes("https://") )
                {
                    image.file = protocoll + "://" + req.headers.host + "/" + image.file;
                }
                return image;
            });
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
