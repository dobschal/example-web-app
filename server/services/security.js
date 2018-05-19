const jwt = require("jsonwebtoken");
const sha512 = require('js-sha512').sha512;
const secret = "blablabla"; // TODO: move to environment variables
const hashSalt = "yeahyeahyeah"; // TODO: move to environment variables

/**
 * @param {array} allowedUserRoles 
 */
function protect( allowedUserRoles )
{
    return ( req, res, next ) => {
        try {
            let authHeader = req.headers["authorization"];
            let splittedAuthHeader = authHeader.split(" ");
            let token = splittedAuthHeader[ 1 ];
            jwt.verify( token, secret, (err, data) => {
                if( err || !allowedUserRoles.includes( data.userRole ))
                {
                    err = new Error("Permission denied.");
                    err.status = 403;
                    return next( err );
                }

                req.token = token;
                req.tokenData = data;
                next();
            });
        } catch(e) {
            let err = new Error("Permission denied.");
            err.status = 403;
            next( err );
        }
    };
}

/**
 * 
 * @param {string} username 
 * @param {string} userRole 
 * @param {string} userId
 */
function getToken( username, userRole, userId )
{
    // TODO: Add expiration to token payload
    return jwt.sign( { userRole, username, userId }, secret);
}

/**
 * @param {string} plaintextPassword 
 */
function hashPassword( plaintextPassword )
{
    return sha512( plaintextPassword + hashSalt );
}

module.exports = { getToken, protect, hashPassword };