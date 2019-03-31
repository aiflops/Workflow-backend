/** biblioteki  */
const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const Exits = require('../models/exits');
const OverTime = require('../models/overTimes');

const ExitAswerURL = require('../models/exitAnswerURLs');
const jwt = require('jsonwebtoken');
const sequelize = require('../assets/sequlize');

const nodemailer = require('nodemailer');


/** transporter dla gmail  */

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'oes.mail.test@gmail.com',
           pass: '4sFrNwUByS'
       }
   });


/** funkcja generujaca email */
 function generateEmail(from, to, subject, html){
     return {
        from: from,
        to: to,
        subject: subject,
        html: html
     }
 }  


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

/** tworzy wyjscia */
exports.createExit = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);

    let nameUser;
    let exitGlobal; 
    let exitAswerURL;

    User.findOne({where : {user_id: body.idUser}}).then(user=> {
        if(!user || user.activeAccount == 0){
            const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
            error.statusCode = 403;
            throw error;
        } else {
            nameUser = user.first_name + ' ' + user.last_name;
            return user.createExit({
                date: body.date,
                time_start: body.timeStart,
                duration: body.duration,
                topic: body.topic,
                desc: body.desc,
            });
        }
    }).then(exit=> {
        exitGlobal = exit;
        return exit.createOverTime({
            date: body.overTimeDate,
            time_start: body.timeStartOverTime,
            duration: body.duration
        });


    })
    .then((overtime)=> {
        if(overtime){
            res.status(200).json(
                {
                    status: 200,
                    data: null,
                    message: "Wyjście zostało dodane zostało dodane"
                });
        return overtime
        }else return null;
    })
    .then(overtime=>{
        if(overtime){

            
            let accept = Math.random().toString(36).substring(7);
            let refuse = Math.random().toString(36).substring(7);

            const content = '<h2>Pracownik: ' + nameUser + '  prosi o wyjście</h2>'+
                            '<div>'+
                            '<p> <b>Tytuł wyjścia:</b> '+ exitGlobal.topic + '</p>'+
                            '<p> <b>Data wyjścia:</b> '+ exitGlobal.date +' </p>'+
                            '<p> <b>Godzina wyjścia:</b> '+ exitGlobal.time_start +'</p>'+
                            '<p> <b>Czas trwania:</b> '+ exitGlobal.duration +'</p>'+
                            '<p> <b>Opis :</b> '+ exitGlobal.desc +'</p>'+
                            '<p> <b>Termin odróbczy :</b> '+ overtime.date +' o godzinie '+ overtime.time_start +'</p>'+
                            '</div>'+
                            '<p>Aby akceptować kliknij  http://localhost:4200/confirm/'+ accept + ' link</p>'+
                            '<p>Aby odrzucić kliknij  http://localhost:4200/refuse/'+ refuse + ' link</p>';

            User.findAll({where : {role_id: 2}}).then( users=> {
                return users.map(user=> {
                    return {
                        email: user['dataValues']['email'],
                        id: user['dataValues']['user_id']
                }
                })
            }).then(users=>{

                users.forEach(boss=> {
                
                const mailOptions= generateEmail(
                    'oes.mail.test@gmail.com', 
                        boss.email,
                        'Pracownik: ' + nameUser + ' prosi o wyjście',
                        content
                );
                transporter.sendMail(mailOptions, (err, info) => {
                    if(info){
                        exitGlobal.createMessageUser({
                            id_boss: boss.id
                        }).then(
                            ()=>{
                                ExitAswerURL.findOrCreate({
                                    where: {
                                        accept_hash: accept,
                                        exitId: exitGlobal.id
                                    },
                                    defaults: {
                                        accept_hash: accept,
                                        reject_hash: refuse,
                                        exitId: exitGlobal.id
                                    }
                                });
                            }
                        )
                    }
                });
            });
            });
        }
    })
    .catch( err=> {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

}

/** edytuje wyjscia */
exports.editExit = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);
    const bodyId = body.idExit;
    let nameUser;
    let exitGlobal;

    Exits.findOne({where: {id: bodyId}}).then(exit=>{
        if(!exit){
            const error = new Error('Podane wyjście nie istnieje w bazie');
            error.statusCode = 403;
            throw error;
        }else {
            return exit
        }
    }).then(exit=> {
        sequelize.query('select * from users where user_id = '+ exit.userUserId).then(
            user=> {
                userF= user[0].pop();
                nameUser = userF.first_name + ' ' + userF.last_name;
            }
        )
        return exit.update({
                date: body.date,
                time_start: body.timeStart,
                duration: body.duration,
                topic: body.topic,
                desc:body.desc,
                status: 0 
            });
        }).then((exit)=>{
            exitGlobal = exit
            return OverTime.findOne({where: {exitId: exit.id}})
        }).then((overtime)=> {

            return overtime.update({
                date: body.overTimeDate,
                time_start: body.timeStartOverTime,
                duration: body.duration
            });
        }).then((overtime)=> {

            if(overtime) {

                res.status(200).json(
                    {
                        status: 200,
                        data: null,
                        message: "Dokonano edycji danych"
                    }
                    );        
                return overtime;
                }
                else { return null;}
                
    })
    .then(overtime=>{
        if(overtime){

            let accept = Math.random().toString(36).substring(7);
            let refuse = Math.random().toString(36).substring(7);
            

            const content = '<h2>Pracownik: ' + nameUser + '  prosi o wyjście</h2>'+
                            '<div>'+
                            '<p> <b>Tytuł wyjścia:</b> '+ exitGlobal.topic + '</p>'+
                            '<p> <b>Data wyjścia:</b> '+ exitGlobal.date +' </p>'+
                            '<p> <b>Godzina wyjścia:</b> '+ exitGlobal.time_start +'</p>'+
                            '<p> <b>Czas trwania:</b> '+ exitGlobal.duration +'</p>'+
                            '<p> <b>Opis :</b> '+ exitGlobal.desc +'</p>'+
                            '<p> <b>Termin odróbczy :</b> '+ overtime.date +' o godzinie '+ overtime.time_start +'</p>'+
                            '</div>'+
                            '<p>Aby akceptować kliknij  http://localhost:4200/confirm/'+ accept + ' link</p>'+
                            '<p>Aby odrzucić kliknij  http://localhost:4200/refuse/'+ refuse + ' link</p>';

            User.findAll({where : {role_id: 2}}).then( users=> {
                return users.map(user=> {
                    return {
                        email: user['dataValues']['email'],
                        id: user['dataValues']['user_id']
                }
                })
            }).then(users=>{

                users.forEach(boss=> {
                
                const mailOptions= generateEmail(
                    'oes.mail.test@gmail.com', 
                        boss.email,
                        'Pracownik: ' + nameUser + ' edytowal wyjście',
                        content
                );


                transporter.sendMail(mailOptions, (err, info) => {
                    if(info){
                        exitGlobal.createMessageUser({
                            id_boss: boss.id
                        }).then(
                            ()=>{
                                ExitAswerURL.findOrCreate({
                                    where: {
                                        accept_hash: accept,
                                        exitId: exitGlobal.id
                                    },
                                    defaults: {
                                        accept_hash: accept,
                                        reject_hash: refuse,
                                        exitId: exitGlobal.id
                                    }
                                });
                            }
                        )
                    }
                });
            
            });
            })
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

/** pobiera wyjscia */
exports.getExit = (req, res, next) => {
    checkToken(req);
    const body = req.query;
    const bodyId = body.idExit;


    Exits.findOne({where: {id: bodyId}}).then(exit=> {
        if(!exit){
            const error = new Error('Podane wyjście nie istnieje w bazie');
            error.statusCode = 403;
            throw error;
        }else {
            res.status(200).json(
                {
                    status: 200,
                    data: exit,
                    message: null
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

/** pobiera wyjscia dla user o parametrze i */
exports.getExits = (req, res, next) => {
    checkToken(req);
    const body = req.query;


    User.findOne({where: {user_id : body.id}}).then(user=> {
        if(!user || user.activeAccount == 0){
            const error = new Error('Podany użytkownik nie istnieje w bazie danych.');
            error.statusCode = 401;
            throw error;
        }else {
            sequelize.query('SELECT *  FROM exits WHERE userUserId = '+ user.user_id ).then()
            .then(exits => {
                return exits.pop();
              }).then(exits=> {

                  res.status(200).json(
                    {
                        status: 200,
                        data: exits,
                        message: null
                    }
                  );

              });
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


/** pobiera wyjscia */
exports.getUserExits = (req, res, next) => {
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
            sequelize.query('SELECT * FROM exits WHERE userUserId = '+ user.user_id + ' ORDER BY date' ).then()
            .then(exits => {
                return exits.pop();
              }).then(exits=> {

                  res.status(200).json(
                    {
                        status: 200,
                        data: exits,
                        message: null
                    }
                  );

              });
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


/** usuwa wyjscia */
exports.deleteExit = (req, res, next) => {
    checkToken(req);
    const  body = validation(req);
    const bodyId = body.idExit;

    Exits.destroy({where: {id: bodyId}}).then(()=> {
    OverTime.destroy({where: {exitId: null}}).then(()=> {
                res.status(200).json(
                    {
                        status: 200,
                        data: null,
                        message: 'Usunięto'
                    }
                  );
        })
    }).catch(
        err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
        next(err);
    });
}


exports.getExitsFromTime = (req, res, next) => {
    checkToken(req);
    const body = req.query;

    const strQuery =  "SELECT *  FROM exits WHERE (userUserId = '"+ body.idUser +"') AND (date between '" + body.startTime + "' AND'" + body.stopTime+"')"
    console.log('strQuery', strQuery);
    sequelize.query(strQuery,
       ).then(exits=> {
          return exits.pop();
      }).then(exits=> {
          console.log(exits);
          res.status(200).json(
            {
                status: 200,
                data: exits,
                message: null
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

exports.getUsersExits = (req, res, next) => {
    checkToken(req);
    const body = req.query;

    const strQueryExits =  "SELECT *  FROM exits WHERE userUserId IN (SELECT user_id FROM users WHERE activeAccount = '1' AND role_id = '1') AND (date between '" + body.startTime + "' AND'" + body.stopTime+"')";
    sequelize.query(strQueryExits,
         ).then(exit=> {
             res.status(200).json(
                {
                    status: 200,
                    data: exit.pop(),
                    message: null
                }
              );
         }).catch(
            err => {
                if(!err.statusCode) {
                    err.statusCode = 500;
                }
            next(err);
        });
}