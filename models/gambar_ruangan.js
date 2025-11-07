const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const gambar_ruangan = sequelize.define('gambar_ruangan', {
    id_gambar_ruangan:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    id_ruangan: {
        type: DataTypes.UUID,
        allowNull: false
    },
    gambar: {
        type: DataTypes.STRING(255),
        allowNull: false
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
    tableName: 'gambar_ruangan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = gambar_ruangan