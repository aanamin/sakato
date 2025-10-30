const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const user = sequelize.define('user', {
    id_user:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nama:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nohp:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    username:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at:{
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = user