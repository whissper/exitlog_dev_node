var bcrypt = require('bcrypt-nodejs');
/**
 * CryptEngine class
 */
class CryptEngine {
    
    constructor() {
        
    }
    
    //create a password hash
    static hashPass(stringVal) {
        return bcrypt.hashSync(stringVal);
    }
    
    //verify password
    static passVerify(stringVal, hashVal) {
        var hash = hashVal.replace('$2y$', '$2a$');
        
        return bcrypt.compareSync(stringVal, hash);
    }
    
}

module.exports = CryptEngine;