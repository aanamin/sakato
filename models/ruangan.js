const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const ruangan = sequelize.define('ruangan', {
    id_ruangan:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    nama_ruangan: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    gambar: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    deskripsi:{
        type: DataTypes.TEXT,
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
    tableName: 'ruangan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = ruangan