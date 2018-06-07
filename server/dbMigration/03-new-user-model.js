const User = require("../models/User");

exports.id = 'NewUserModel';

exports.up = done =>
{
    User.remove({}, error => {

        if( error ) throw new Error( error );

        console.log("[DBMigration03] Removed all users cause of new user model.");

        done();
    });
};