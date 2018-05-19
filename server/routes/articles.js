const express = require('express');
const Article = require("../models/Article");
const ArticleComment = require("../models/ArticleComment");
const router  = express.Router();
const security = require("../services/security");
const uploader = require("../uploadHandlers/articleImage");

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
        const { title, content } = req.body;
        var myArticle = new Article({ title: title, content: content, modifiedAt: new Date() });
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
        req.body.modifiedAt = new Date();
        Article.findByIdAndUpdate( articleId, req.body, {new: true}, ( err, updatedArticle ) => {
            if (err) return next(err);
            res.send({ success: true, article: updatedArticle });
        });
    });

    return router;
}
