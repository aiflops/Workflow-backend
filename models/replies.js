const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');

const Reply = sequelize.define('reply', {
    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    
    desc: {
        type:Sequelize.STRING,
        defaultValue: null
    },
    id_boss: {
        type:Sequelize.INTEGER,
        allowNull: false,
    }
});
module.exports = Reply;
