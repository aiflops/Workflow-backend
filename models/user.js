const Sequelize = require('sequelize');

const sequelize = require('../assets/sequlize');

const User = sequelize.define('user', {
    user_id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    role_id : {
        type:Sequelize.INTEGER,
        allowNull: false,
    },
    //  1 - worker, 2 - pracownik
    last_name: {
        type:Sequelize.STRING,
        allowNull: false
    },
    first_name: {
        type:Sequelize.STRING,
        allowNull: false
    },

    email: {
        type:Sequelize.STRING,
        allowNull: false,
        unique: true,
    },

    password: {
        type:Sequelize.STRING,
        allowNull: false
    },

    authToken: {
        type:Sequelize.STRING,
        defaultValue: null
    },

    activeAccount: {
        type:Sequelize.INTEGER,
        defaultValue: 1
    }
});





module.exports = User;

