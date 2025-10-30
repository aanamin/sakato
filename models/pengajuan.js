const {DataTypes} = require('sequelize')
const sequelize = require('../config/db')

const pengajuan = sequelize.define('pengajuan', {
    id_pengajuan:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    id_user: {
        type: DataTypes.UUID,
        allowNull: false
    },
    id_ruangan: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tanggal_sewa: {
        type: DataTypes.DATE,
        allowNull: false
    },
    waktu_mulai: {
        type: DataTypes.TIME,
        allowNull: false
    },
    waktu_selesai: {
        type: DataTypes.TIME,
        allowNull: false
    },
    surat_peminjaman: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    organisasi_komunitas: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    kegiatan: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
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
    tableName: 'pengajuan',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = pengajuan