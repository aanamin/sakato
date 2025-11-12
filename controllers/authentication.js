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

const lihatProfil = async (req,res)=>{
    try {
        const id_user = req.id_user
        const profil = await modelUser.findOne({
            where: {
                id_user: id_user
            },
            attributes: ['email', 'nama', 'nohp', 'username','id_user']
        })

        if (!profil) {
            return res.status(404).json({
                success: false,
                message: "Profil tidak ditemukan"
            })
        }
        return res.status(200).json({
            success: true, 
            message: "Profil ditemukan",
            profil: profil
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const ubahPassword = async (req, res) => {
    try {
        // Ambil id_user dari request (diasumsikan sudah disuntikkan oleh middleware/otentikasi)
        const id_user = req.id_user; 
        
        // Ambil password lama dan password baru dari body request
        const {
            oldPassword,
            newPassword
        } = req.body

        // 1. Validasi Input Dasar
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Silahkan lengkapi password lama dan password baru'
            })
        }

        // 2. Cari User Berdasarkan ID
        const user = await modelUser.findOne({
            where: {
                id_user: id_user // Sesuaikan nama kolom ID di model Anda
            }
        })

        // Cek apakah user ditemukan (seharusnya selalu ditemukan jika req.id_user valid)
        if (!user) {
            // Ini adalah kondisi yang tidak seharusnya terjadi jika otentikasi bekerja dengan benar
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            })
        }

        // 3. Verifikasi Password Lama
        // Bandingkan password lama yang diinput dengan hash password di database
        const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password lama tidak cocok'
            })
        }

        // 4. Hash Password Baru
        const salt = bcrypt.genSaltSync(10);
        const hashedNewPass = bcrypt.hashSync(newPassword, salt);

        // 5. Update Password di Database
        await modelUser.update({
            password: hashedNewPass
        }, {
            where: {
                id_user: id_user // Sesuaikan nama kolom ID
            }
        })

        // 6. Respon Berhasil
        return res.status(200).json({
            success: true,
            message: 'Password berhasil diubah'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengubah password. Internal Server Error'
        })
    }
}

module.exports = {
    login,
    register,
    editProfil,
    lihatProfil,
    ubahPassword,
}