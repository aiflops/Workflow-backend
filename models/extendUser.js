const Sequelize = require('sequelize');

const sequelize = require('../assets/sequlize');

const ExtendUser = sequelize.define('extendUser', {
    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    endExtend: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    startExtend: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    }

});

module.exports = ExtendUser;