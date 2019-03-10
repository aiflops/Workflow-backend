const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {

    const authHeader = req.get('Authorization');

    if(!authHeader) {
        const error = new Error('Nie udana autoryzacja. Brak tokenu');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
            if(!decodedToken) {
                const error = new Error('Błąd logowania');
                error.statusCode = 401;
                throw error;
            }

    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    User.findOne({where: {authToken:token, email: decodedToken.email}})
    .then(user => {
        if(!user) {
            return 401;
        }
    })
    .then(code=> {
        if (code != 401){
            req.userId = decodedToken.userId;
            req.statusCode = 200;            
            
        }else{
            req.userId = decodedToken.userId;
            req.statusCode = code;
        }
        next();
    });
    
    
    
}