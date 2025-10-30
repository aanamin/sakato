const response = require('express')
require('dotenv').config()
require('../models/associations')
const modelRuangan = require('../models/ruangan')
const modelBarang = require('../models/barang')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    Op
} = require('sequelize')

const tambahBarang = async(req,res)=>{
    try {
        const {
            nama_barang,
            stok_tersedia
        } = req.body
        await modelBarang.create({
            nama_barang: nama_barang,
            stok_tersedia: stok_tersedia
        })
        return res.status(200).json({
            success: true,
            message: "Barang berhasil ditambahkan"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}

const tambahRuangan = async(req,res)=>{
    try {
        const {
            nama_ruangan,
            deskripsi,
            
        } = req.body

        const gambar_ruangan = req.file ? req.file.filename : null;

        const cekAvail = await modelRuangan.findOne({
            where: {
                nama_ruangan: nama_ruangan
            }
        })

        if (cekAvail) {
            return res.status(400).json({
                success: false,
                message: "Ruangan tersebut telah ada"
            })
        }

        const createRuangan = await modelRuangan.create({
            nama_ruangan: nama_ruangan,
            deskripsi: deskripsi,
            gambar: gambar_ruangan,
        })

        if (!createRuangan) {
            return res.status(400).json({
                success: false,
                message: "Ruangan gagal ditambahkan"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Ruangan berhasil ditambah",
            data: createRuangan
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}

module.exports ={
    tambahBarang,
    tambahRuangan
}