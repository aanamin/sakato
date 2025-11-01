const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const pengajuan_barang = sequelize.define('pengajuan_barang', {
    id_pengajuan_barang:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    id_pengajuan: {
        type: DataTypes.UUID,
        allowNull: false
    },
    id_barang: {
        type: DataTypes.UUID,
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
    tableName: 'pengajuan_barang',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = pengajuan_barang