/**
 *  Returns the string of the userRole or an empty string.
 *  @returns {string} userRole
 */
function getUserRole()
{
    let token = window.localStorage.getItem("token");
    let tokenData = getJWTokenPayload( token );
    return tokenData && tokenData.userRole ? tokenData.userRole : "";
}

/**
 *  Returns an object with the content of the jsonwebtoken payload.
 *  @param {string} token - authentication token for http header
 *  @return {object} tokenPayload
 */
function getJWTokenPayload( token )
{
    try {
        let splittedToken = token.split("."); // header, payload, signature
        let base64EncodedPayload = splittedToken[1];
        let jsonStringPayload = atob( base64EncodedPayload );
        let payload = JSON.parse( jsonStringPayload );
        return payload;
    } catch(e) {
        console.log("[security.js] Cannot read JWT payload.");
        return null;
    }        
}

module.exports = { getJWTokenPayload, getUserRole };