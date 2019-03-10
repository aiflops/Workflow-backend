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
    user_id : {
        type:Sequelize.INTEGER,
        allowNull: false,
    },

    time_end: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    }

});
module.exports = ExtendUser;