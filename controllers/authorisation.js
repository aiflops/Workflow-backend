/** biblioteki  */
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sequelize = require('sequelize');


/** opcje dla mailera */
var options = {
    service: 'gmail',
    auth: {
           user: 'oes.mail.test@gmail.com',
           pass: '4sFrNwUByS'
       }
}


 /** obiekt mailer-a */
var mailer = nodemailer.createTransport(options);

/** funkcja walidacji zwraca nam wsztkie zadane pola, jesli przeszla walidacja */
function validation(req){

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        console.log('errors', );
        const error =  new Error(errors.array().pop().msg);
        error.statusCode = 401;
        error.data = errors.array();
        throw error;
    }
    var body = req.body;
    return body; 
}


/** sprawdzanie tokenu poprawności, jesli routing wymaga logowania */

function checkToken(req){

    let middleWareStatus = req.statusCode;
    if (middleWareStatus == 401) {
        const error =  new Error('Walidacja nie powiodła się, sesja wygasła');
        error.statusCode = 401;
        throw error;
    }
}
 

/** test działania api */
exports.getTestData =  (req, res, next) => {
    res.status(200).json(
        {
            status: 200,
            info: "Połączenie GET ustalone"
        }
    );
};

/** rejestracja użytkownika */
exports.addUser = (req, res, next) => {

    const body = validation(req);
    const role_id = body['role_id'];
    const last_name  = body['last_name'];
    const first_name = body['first_name'];
    const email = body['email'];
    const plain_password = body['password'];
    
    bcrypt.hash(plain_password, 12)
    .then( hashedPw => {
        const user = new User({
            email: email,
            password: hashedPw,
            first_name: first_name,
            last_name: last_name,
            role_id: role_id
        });
        return user.save();
        }).then(user => {
            res.status(200).json(
                {
                    status: 200,
                    message:'Utworzono użytkownika',
                    data: {
                        user_id: user.user_id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role_id: user.role_id,
                    }
                }
            );
        })
        .catch(
                    err => {
                        if(!err.statusCode) {
                            err.statusCode = 500;
                        }
                    next(err);
                });

        };


exports.deleteUser = (req,res,next) => {
    const body = validation(req);

    const email = body.email;
    User.find({ where: {email:email} }).then(
        user => {
            if(!user || user.activeAccount == 0){
                const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
                error.statusCode = 403;
                throw error;
            }
            user.activeAccount = 0;
            user.save();
            res.status(200).json(
                {
                    status: 200,
                    data: {},
                    message: "Użytkownik usunięty"
                });

        }
    )
    
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}


/** akcja wykonywana przy logowaniu użytkownika */

exports.login = (req, res, next) => {

    const body = validation(req);

    const email = body.email;
    const password = body.password;

    let loadedUser;

    User.find({ where: {email:email} })
    /** pobranie user-a */
    .then(
        /** srawdzenie czy instnieje w bazie danych  */
        user => {
            if(!user || user.activeAccount == 0){
                const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
                error.statusCode = 403;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        //** sprawdzenie czy haslo jest poprawne */
        .then(isEqual => {
    
            if(!isEqual) {
                const error =  new Error('Błędne hasło');
                error.statusCode = 403;
                throw error;
            }

            const token = jwt.sign(
            {
                email: loadedUser.email,
                userId :loadedUser.user_id.toString()
            },
            'somesupersecretsecret',
            {
                expiresIn: '30d'
            }
        );


        loadedUser.updateAttributes({'authToken' : token}).then(
            ()=>
            {
                res.status(200).json(
                    {
                        status: 200,
                        data: {
                            token: token,
                            userId: loadedUser.user_id.toString(),
                            userConfirm: loadedUser.confirm
                        },
                        message: "Zalogowany"
                    });
            });
        })
        .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

/** wysyła reset hasła na email, generowane nowe randomowe hasło wysyłane na email*/
exports.resetPassword = (req, res, next) => {
    
    const  body = validation(req);
    const email = body.email;
    let loadedUser = null;

    const randomValue = crypto.randomBytes(4).toString('hex');
    User.findOne({ where: {email:email} }).then( user => {
        loadedUser = user;
    }).then( ()=>
    {
        bcrypt.hash(randomValue, 12).then(hash => {
            loadedUser.password = hash;
            loadedUser.save();

            const mailOptions = {
                from: 'oes.mail.test@gmail.com', 
                to: loadedUser.email, 
                subject: 'Twoje nowe hasło', 
                html: '<b>Nowe hasło to: </b> '+ randomValue
              };
            mailer.sendMail(mailOptions);

        })
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

    res.status(200).json(
        {
            status: 200,
            data: {},
            message: "Wygenerowano nowe hasło, wysłano na adres email!"
        });
}




/******************************************************** WYMAGANE LOGOWANIE *************************************************** */

/** zmiana hasła po tym jak użytkownik jest zalogowany */
exports.changePassword = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);
    const email = body.email;

    const new_password = body.new_password;
    const old_password = body.old_password;
    let loadedUser;

    User.findOne({ where: {email:email} })
    .then(user => {

        if(!user || user.activeAccount == 0){
            const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
            error.statusCode = 403;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(old_password, user.password);

    } ).then(isEqual => {
    
        if(!isEqual) {
            const error =  new Error('Błędne hasło');
            error.statusCode = 403;
            throw error;
        }else {
            bcrypt.hash(new_password, 12).then(hash => {
                loadedUser.password = hash;
                loadedUser.save();
                res.status(200).json(
                {
                    status: 200,
                    data: {},
                    message: "Hasło zostało zmienione"
                });
                
            }).catch( err=> {
                if(!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
            });
        }
    }).catch( err=> {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}



/**
 * sprawdzenie, czy użytkownik jest zalogowany
 */
exports.isAuth = (req, res, next) => {
        checkToken(req);

        res.status(200).json(
            {
                status: 200,
                data: null,
                message: "Zalogowany"
            }
        );
}

//hacked



