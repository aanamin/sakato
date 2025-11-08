const response = require('express')
require('dotenv').config()
require('../models/associations')
const modelUser = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    Op
} = require('sequelize')

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body
        console.log(email, password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Silahkan lengkapi data'
            })
        }
        const findAkun = await modelUser.findOne({
            where: {
                email: email
            }
        })
        if (!findAkun) {

            return res.status(400).json({
                success: false,
                message: "Data yang anda masukkan salah"
            })
        }

        if (!findAkun) {
            console.log("email salah");
            return res.status(400).json({
                success: false,
                message: "data yang dimasukkan salah"
            })
        }
        bcrypt.compare(password, findAkun.password, async (err, results) => {
            if (err || !results) {
                console.log("password salah");
                return res.status(400).json({
                    success: false,
                    message: 'Data yang anda masukkan salah'
                })
            }
            const id_user = findAkun.id_user
            const token = jwt.sign({
                    email,
                    id_user,

                },
                process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '30d'
                }
            )
            req.session.id_user = id_user

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                success: true,
                message: "Login berhasil",
                token,
                id_user
            });
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Gagal login"
        })
    }
}

const register = async (req, res) => {
    try {
        const {
            nohp,
            email,
            nama,
            username,
            password,
        } = req.body

        if (!nohp || !email || !password || !nama || !username) {
            return res.status(400).json({
                success: false,
                message: 'Silahkan lengkapi data'
            })
        }
        const statusEmail = await modelUser.findOne({
            where: {
                email: email
            }
        })
        if (statusEmail) {
          return  res.status(400).json({
                success: false,
                message: 'email telah terdaftar'
            })
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPass = bcrypt.hashSync(password, salt)
        const tambahAkun = await modelUser.create({
            nohp: nohp,
            email: email,
            password: hashedPass,
            nama: nama,
            username: username
        })
       
            return res.status(200).json({
                success: true,
                message: 'Akun berhasil terdaftar'

            })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal Register Internal Server Error'
        })
    }
}

const editProfil = async (req,res)=>{
    try {
        const {
            nohp,
            email,
            nama,
            username,
        } = req.body
        const id_user = req.id_user
        const findAkun = await modelUser.findOne({
            where: {
                email: email,
                id_user:{
                    [Op.ne]: id_user
                }
            }
        })
        if (findAkun) {
            return res.status(400).json({
                success: false,
                message: "Email telah terdaftar"
            })
        }
        const edit = await modelUser.update({
            nohp,
            email,
            username,
            nama
        }, {
            where: {
                id_user: id_user
            }
        })
        return res.status(200).json({
            success: true,
            message: "Berhasil mengedit profil"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengedit profil (Internal Server Error)"
        })
    }
}
module.exports = {
    login,
    register,
    editProfil
}