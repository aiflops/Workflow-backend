const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');

const OverTime = sequelize.define('overTime', {
    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    
    time_start: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    
    duration: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    
    
});

module.exports = OverTime;
