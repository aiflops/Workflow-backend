const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');


const ExitAswerURL = sequelize.define('exitAswerURL', {
    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    accept_hash: {
        type:Sequelize.STRING,
        allowNull: false,

    },
    reject_hash: {
        type:Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = ExitAswerURL;