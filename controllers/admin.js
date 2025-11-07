const response = require('express')
require('dotenv').config()
require('../models/associations')
const modelRuangan = require('../models/ruangan')
const modelBarang = require('../models/barang')
const modelGambarRuangan = require('../models/gambar_ruangan')
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

const tambahRuangan = async (req, res) => {
    try {
        // 1. Ambil data ruangan dari body
        const {
            nama_ruangan,
            deskripsi,
        } = req.body

      
        const gambar_ruangan_files = req.files || []; 

        // 3. Cek ketersediaan nama ruangan
        const cekAvail = await modelRuangan.findOne({
            where: {
                nama_ruangan: nama_ruangan
            }
        })

        if (cekAvail) {
            // TODO: Tambahkan logika untuk menghapus file yang sudah diupload ke server jika ada
            return res.status(400).json({
                success: false,
                message: "Ruangan tersebut telah ada"
            })
        }

        // 4. Buat Ruangan utama terlebih dahulu
        const createRuangan = await modelRuangan.create({
            nama_ruangan: nama_ruangan,
            deskripsi: deskripsi,
            // Field gambar di tabel utama ruangan (jika ada) bisa diisi null/kosong
        })

        if (!createRuangan) {
            // TODO: Tambahkan logika untuk menghapus file yang sudah diupload ke server jika ada
            return res.status(400).json({
                success: false,
                message: "Ruangan gagal ditambahkan"
            })
        }

        // Ambil ID ruangan yang baru dibuat
        const ruanganId = createRuangan.id_ruangan;
        const listGambarToCreate = [];
        console.log(ruanganId, "asdasdasdasdasfsfasfsaf");
        
        // 5. Siapkan data gambar untuk dimasukkan ke tabel gambar_ruangan
        if (gambar_ruangan_files.length > 0) {
            gambar_ruangan_files.forEach(file => {
                listGambarToCreate.push({
                    id_ruangan: ruanganId, // Foreign Key
                    gambar: file.filename, // Nama atribut di tabel 'gambar_ruangan' adalah 'gambar'
                });
            });

            // 6. Masukkan semua data gambar ke tabel gambar_ruangan (Bulk Insert)
            await modelGambarRuangan.bulkCreate(listGambarToCreate);
        }
        
        return res.status(200).json({
            success: true,
            message: "Ruangan berhasil ditambah beserta gambarnya",
            data: createRuangan,
            jumlah_gambar_tersimpan: listGambarToCreate.length
        })

    } catch (error) {
        console.error(error); // Gunakan console.error untuk error
        
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