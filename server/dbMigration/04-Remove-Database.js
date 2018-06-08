const User = require("../models/User");
const Article = require("../models/Article");

exports.id = 'RemoveDatabase';

exports.up = done =>
{
    User.remove({}, error => {

        if( error ) throw new Error( error );

        console.log("[DBMigration04] Removed all users cause of new user model.");

        Article.remove({}, error2 => {

            if( error2 ) throw new Error( error2 );
    
            console.log("[DBMigration04] Removed all articles cause of new model.");
    
            done();
        });
    });
};