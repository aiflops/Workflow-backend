const Sequelize = require('sequelize');
const sequelize = require('../assets/sequlize');

const Exit = sequelize.define('exit', {
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

    topic: {
        type:Sequelize.STRING,
        allowNull: false,
    },

    desc: {
        type:Sequelize.STRING,
        defaultValue: null
    },

    status: {
        type:Sequelize.INTEGER,
        defaultValue: 0
    },

});

module.exports = Exit;