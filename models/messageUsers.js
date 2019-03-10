
const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');
const MessageUser = sequelize.define('messageUser', {
    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    id_boss: {
        type:Sequelize.INTEGER,
        allowNull: false,
    }
    
});

module.exports = MessageUser;
