/** biblioteki  */
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');


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

exports.userMy = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);
    const id = body.id;

    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    let decodedToken = jwt.verify(token, 'somesupersecretsecret');    

    User.findOne({where: {email: decodedToken.email}}).then(user=> {
        if(!user || user.activeAccount == 0){
            const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
            error.statusCode = 401;
            throw error;
        }else {
            
            res.status(200).json(
                {
                    status: 200,
                    data: {
                        id: user.user_id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        roleId: user.role_id
                    },
                    message: ''
                }
            );
        }
    })
    .catch(
                err => {
                    if(!err.statusCode) {
                        err.statusCode = 500;
                    }
                next(err);
            });

}

exports.user = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);
    const id = body.id;

    User.findOne({where: {user_id : id}}).then(user=> {
        if(!user || user.activeAccount == 0){
            const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
            error.statusCode = 401;
            throw error;
        }else {
            
            res.status(200).json(
                {
                    status: 200,
                    data: {
                        id: user.user_id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        roleId: user.role_id
                    },
                    message: ''
                }
            );
        }
    })
    .catch(
                err => {
                    if(!err.statusCode) {
                        err.statusCode = 500;
                    }
                next(err);
            });

}




exports.usersAll = (req, res, next) => {
    checkToken(req);

    sequelize.query('SELECT * FROM users WHERE role_id = 1').then(users => {

        const usersMap = users.pop().map(user=> {
            return {
                id: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                roleId: user.role_id
            }
        })

        return usersMap;

    }).then(users=> {
        res.status(200).json(
            {
                status: 200,
                data: users,
                message: "usersAll"
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

}


exports.userTimetable = (req, res, next) => {
    checkToken(req);

    res.status(200).json(
        {
            status: 200,
            data: null,
            message: "userTimetable"
        }
    );
}


exports.usersTimetables = (req, res, next) => {
    checkToken(req);

    res.status(200).json(
        {
            status: 200,
            data: null,
            message: "usersTimetables"
        }
    );
}

exports.setDeputy = (req, res, next) => {
    checkToken(req);

    res.status(200).json(
        {
            status: 200,
            data: null,
            message: "setDeputy"
        }
    );
}