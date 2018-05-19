const express = require('express');
const Article = require("../models/Article");
const ArticleComment = require("../models/ArticleComment");
const router  = express.Router();
const security = require("../service/security");
const multer = require("multer");

var articleImageStorage = multer.diskStorage({
    destination: function (req, file, cb)
    {
      cb(null, './uploads/article-images');
    },
    filename: function (req, file, cb)
    {
      cb(null, file.fieldname + '-' + Date.now() + "-" + file.originalname );
    }
});

const articleImageUpload = multer({ storage: articleImageStorage });

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
        var myArticleComment = new ArticleComment({ articleId, content, username });
        myArticleComment.save((err, myArticleComment) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved article comment in database.", articleComment: myArticleComment });
            io.emit( "NewComment", myArticleComment );
        });
    });

    router.post('/articles', security.protect(["user"]), articleImageUpload.single("image"), function(req, res, next) {
        console.log("[articles.js] Got new uploaded file.", req.file);
        const { title, content } = req.body;
        var myArticle = new Article({ title: title, content: content });
        myArticle.save((err, myArticle) => {
            if (err) return next( err );
            res.send({ success: true, info: "Saved article in database.", article: myArticle });
        });
    });

    router.get('/articles', function(req, res, next) {
        Article.find(( err, articles ) => {
            if (err) return next( err );
            res.send({ success: true, info: "Got articles from database.", articles });
        });
    });

    router.get('/articles/:id', function(req, res, next) {
        const articleId = req.params.id;
        Article.findById( articleId, ( err, article ) => {
            if (err) return next( err );
            if( !article )
            {
                var error = new Error("Not found.");
                error.status = 404;
                return next( error );
            }
            res.send({ success: true, info: "Got article from database.", article });
        });
    });

    router.put("/articles/:id", security.protect(["user"]), function( req, res, next ) {
        const articleId = req.params.id;
        Article.findByIdAndUpdate( articleId, req.body, {new: true}, ( err, updatedArticle ) => {
            if (err) return next(err);
            res.send({ success: true, article: updatedArticle });
        });
    });

    return router;
}
