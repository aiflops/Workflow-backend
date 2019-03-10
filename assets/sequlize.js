const Sequelize = require('sequelize');

const sequelize = new Sequelize('oes', 'root', '', 
{
    dialect:'mysql',
    host:'localhost'
});

module.exports = sequelize;