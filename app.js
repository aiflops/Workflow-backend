/**
 * Głowny plik gdzie zaczyna się całe API znajdują się:
 * impoty, routery, kontrolery
 */

/** importy bibliotek */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/** ustawienia dla aplikacji */
const app = express();
const sequelize = require('./assets/sequlize');


/** import models */
const User = require('./models/user'); 
const ExtendUser = require('./models/extendUser');
const Exit = require('./models/exits');
const ExitAswerURL = require('./models/exitAnswerURLs')

const MessageUser = require('./models/messageUsers')
const OverTime = require('./models/overTimes')
const Reply = require('./models/replies')




/** ustwaienie formatu application/json */
app.use(bodyParser.json());

/**ustawienie dla cors */

var originsWhitelist = [
  'http://localhost:4200',
  'http://www.myproductionurl.com'
];

var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}
app.use(cors(corsOptions));




/** ustawienie headerow pod CORS
 *  bardzo ważnych dla dzialania API */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

/** ustawienie routingu */
const authRoutes = require('./routes/authorisation');
const exitsRoutes = require('./routes/exits');
const overtimeRoutes = require('./routes/overtime');
const userRoutes = require('./routes/user');


/** ustawienie routingu /auth dla authRoutes */
app.use('/auth', authRoutes);
app.use('/exit', exitsRoutes);
app.use('/overtime', overtimeRoutes);
app.use('/user', userRoutes);


/** ustawienie błędów wewnetrzych */
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json(
    {
      message:message,
      data: data,
      status:status
    }
  );
});



// inicjacja bazy danych
ExtendUser.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(ExtendUser);


Exit.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Exit);


ExitAswerURL.belongsTo(Exit, {constraints: true, onDelete: 'CASCADE'});
Exit.hasMany(ExitAswerURL);


Reply.belongsTo(Exit, {constraints: true, onDelete: 'CASCADE'});
Exit.hasMany(Reply);

MessageUser.belongsTo(Exit, {constraints: true, onDelete: 'CASCADE'});
Exit.hasMany(MessageUser);

OverTime.belongsTo(Exit);
Exit.hasOne(OverTime);

sequelize
  .sync({force: false})
  .then(
    result => {
      app.listen(8080);
    })
    .catch(err => {
      console.log(err);
    });
