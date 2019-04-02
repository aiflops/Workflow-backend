/** biblioteki  */
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const OverTime = require('../models/overTimes');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sequelize = require('sequelize');


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


/** pobiera overtime */
exports.getOvertime = (req, res, next) => {
    checkToken(req);

    var idExit = req.params.id;
    OverTime.findOne({
        where: {
            exitId:idExit,
        }
    }).then(OverTime=> {
        if(!OverTime){
            const error = new Error('Podane wyjście nie istnieje w bazie danych');
            error.statusCode = 401;
            throw error;
        }else {
        res.status(200).json(
            {
                status: 200,
                data: OverTime,
                message: "Pobrano"
            }
        );
        }
    }).catch(
        err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
        next(err);
    });


}
