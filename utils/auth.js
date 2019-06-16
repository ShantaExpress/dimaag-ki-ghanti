function isValidToken(jwtDecoded) {
    const now = Date.now().valueOf() / 1000;
    if (typeof jwtDecoded.exp !== 'undefined' && jwtDecoded.exp < now) {
      return false;
    }
    return true;
}

//export module
module.exports = isValidToken;