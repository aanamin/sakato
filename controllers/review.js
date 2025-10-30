const response = require('express')
require('dotenv').config()
require('../models/associations')
const sequelize = require('../config/db');
const modelPengajuan = require('../models/pengajuan')
const modelPengajuanBarang = require('../models/pengajuan_barang')
const modelUser = require('../models/user')
const modelReview = require('../models/review')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const {
    Op,

} = require('sequelize')

const lihatReview = async (req, res) => {
    try {
        const review = await modelReview.findAll({
            include: {
                model: modelPengajuan,
                attributes: [],
                include: {
                    model: modelUser
                }
            }
        })
        if (review.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Belum Ada Review"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Review ditemukan",
            review: review
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const tambahReview = async (req,res)=>{
    try {
        const {id_pengajuan} = req.params
        const id_user = req.id_user
        
        const {
            review,
            rating
        } = req.body

        const tambahReview = await modelReview.create({
            id_pengajuan: id_pengajuan,
            review: review,
            rating: rating
        })

        return res.status(200).json({
            success: true,
            message: "Review berhasil ditambahkan"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {
    lihatReview,
    tambahReview,
}