const response = require('express')
require('dotenv').config()
require('../models/associations')
const sequelize = require('../config/db'); // atau '../config/db' sesuai struktur folder kamu
const modelRuangan = require('../models/ruangan')
const modelBarang = require('../models/barang')
const modelPengajuan = require('../models/pengajuan')
const modelPengajuanBarang = require('../models/pengajuan_barang')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const {
    Op,
    
} = require('sequelize')

const lihatRuangan = async (req,res)=>{
    try {
        const ruangan = await modelRuangan.findAll ({
            attributes: ['id_ruangan', 'nama_ruangan', 'gambar']
        })
        if (ruangan.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Ruangan Belum Ada",
                ruangan : []
            })
        }
        return res.status(200).json({
            success: true,
            message: "Ruangan berhasil ditemukan",
            ruangan: ruangan
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const lihatKetersediaanBarang = async (req, res) => {
    try {
        const { tanggal_sewa, waktu_mulai, waktu_selesai } = req.body; 

        // Validasi input wajib
        if (!tanggal_sewa || !waktu_mulai || !waktu_selesai) {
            return res.status(400).json({
                success: false,
                message: "Parameter tanggal_sewa, waktu_mulai, dan waktu_selesai wajib diisi."
            });
        }

        // Query barang beserta stok yang masih tersedia
        const barangTersedia = await modelBarang.findAll({
            attributes: [
                'id_barang',
                'nama_barang',
                'stok_tersedia',
                [
                    modelBarang.sequelize.literal('`barang`.`stok_tersedia` - COALESCE(SUM(`pengajuan_barangs`.`jumlah`), 0)'),
                    'stok_tersedia_saat_ini'
                ]
            ],
            include: [
                {
                    model: modelPengajuanBarang,
                    attributes: [],
                    required: false,
                    include: [
                        {
                            model: modelPengajuan,
                            attributes: [],
                            where: {
                                tanggal_sewa,
                               status: 'Disetujui',
                                [Op.and]: [
                                    { waktu_mulai: { [Op.lt]: waktu_selesai } },
                                    { waktu_selesai: { [Op.gt]: waktu_mulai } },
                                ]
                            },
                            required: false
                        }
                    ]
                }
            ],
            where: {
                stok_tersedia: { [Op.gt]: 0 }
            },
            group: ['barang.id_barang'],
            having: modelBarang.sequelize.literal('`barang`.`stok_tersedia` - COALESCE(SUM(`pengajuan_barangs`.`jumlah`), 0) > 0'),
            order: [['nama_barang', 'ASC']]
        });

        if (barangTersedia.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Tidak ada barang yang tersedia pada waktu tersebut.",
                barang: []
            });
        }
        const hasilSederhana = barangTersedia.map(item => ({
            id_barang: item.id_barang,
            nama_barang: item.nama_barang,
            stok_tersedia_saat_ini: item.get('stok_tersedia_saat_ini')
        }));

        return res.status(200).json({
            success: true,
            message: "Barang tersedia berhasil ditemukan.",
            barang: hasilSederhana
        });

    } catch (error) {
        console.error("Kesalahan saat melihat ketersediaan barang:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const detailRuangan = async(req,res)=>{
    try {
        const {id_ruangan} = req.params
        const detail = await modelRuangan.findOne({
            where:{
                id_ruangan: id_ruangan
            }
        })
        if (!id_ruangan) {
            return res.status(400).json({
                success: false,
                message: "Ruangan Tidak Ditemukan"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Ruangan Berhasil Ditemukan",
            detail : detail
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const lihatJadwalRuangan = async (req, res) => {
    
    const JAM_OPERASIONAL_MULAI = 7; 
    const JAM_OPERASIONAL_SELESAI = 17;
    const TOTAL_JAM_OPERASIONAL = JAM_OPERASIONAL_SELESAI - JAM_OPERASIONAL_MULAI; // 10 jam
    try {
        const { id_ruangan } = req.params; 
        
        if (!id_ruangan) {
            return res.status(400).json({
                success: false,
                message: "ID Ruangan tidak ditemukan dalam parameter."
            });
        }

        // Tentukan batas waktu (misal: 6 bulan ke depan)
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0); 
        const batasTanggal = new Date(hariIni);
        batasTanggal.setMonth(batasTanggal.getMonth() + 6); // Ambil data 6 bulan ke depan

        // 1. Ambil semua jadwal aktif yang telah disetujui
        const jadwalAktif = await modelPengajuan.findAll({
            where: {
                id_ruangan: id_ruangan, 
                status: 'Disetujui',
                tanggal_sewa: {
                    [Op.gte]: hariIni,
                    [Op.lte]: batasTanggal
                }
            },
            attributes: ['tanggal_sewa', 'waktu_mulai', 'waktu_selesai'], // Hanya ambil kolom yang dibutuhkan
            include: [{
                model: modelRuangan,
                attributes: ['id_ruangan', 'nama_ruangan']
            }],
            // raw: true // Untuk mendapatkan data object sederhana
        });

        if (jadwalAktif.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Tidak ada jadwal booking aktif untuk ruangan ini.",
                ruangan: {},
                tanggal_terbooking: []
            });
        }
       

        // 2. Proses data untuk mengidentifikasi tanggal yang full-booked
        // console.log(jadwalAktif.tanggal_sewa, "asdadas");
        
        // Fungsi bantu untuk menghitung durasi booking dalam jam
        const hitungDurasiBooking = (waktu_mulai, waktu_selesai) => {
            const start = new Date(`2000/01/01 ${waktu_mulai}`);
            const end = new Date(`2000/01/01 ${waktu_selesai}`);
            // Menghitung selisih waktu dalam jam (asumsi jam_mulai dan jam_selesai adalah string 'HH:MM:SS')
            const durasiMs = end.getTime() - start.getTime();
            return durasiMs / (1000 * 60 * 60); 
        };

        const bookingPerTanggal = {};
        jadwalAktif.forEach(booking => {
            
            // --- PERBAIKAN DI SINI ---
            const tanggal = booking.tanggal_sewa; // Ambil seluruh string 'YYYY-MM-DD'
            // --- AKHIR PERBAIKAN ---
            
            const durasi = hitungDurasiBooking(booking.waktu_mulai, booking.waktu_selesai);

            if (!bookingPerTanggal[tanggal]) {
                bookingPerTanggal[tanggal] = {
                    totalDurasi: 0,
                    status: 'Partial'
                };
            }
            bookingPerTanggal[tanggal].totalDurasi += durasi;

            // Cek apakah tanggal sudah full-booked
            if (bookingPerTanggal[tanggal].totalDurasi >= TOTAL_JAM_OPERASIONAL) {
                bookingPerTanggal[tanggal].status = 'Full';
            } else {
                bookingPerTanggal[tanggal].status = 'Partial';
            }
        });

        // 3. Gabungkan tanggal yang Full dan Partial untuk tampilan kalender
        const tanggalUntukKalender = Object.keys(bookingPerTanggal)
            .map(tanggal => ({
                tanggal: tanggal,
                status: bookingPerTanggal[tanggal].status 
            }));

        
        return res.status(200).json({
            success: true,
            message: `Berhasil mendapatkan status booking tanggal untuk ruangan `,
            // Data ini yang akan digunakan untuk menandai tanggal di kalender
            tanggal_terbooking: tanggalUntukKalender 
          
        });

    } catch (error) {
        console.error("Kesalahan saat melihat status booking tanggal:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mendapatkan status booking tanggal (Internal Server Error)"
        });
    }
}

const lihatJadwalRuanganPerTanggal = async (req, res) => {
    try {
        const { id_ruangan, tanggal_sewa } = req.params; 
        
        const jadwalDetail = await modelPengajuan.findAll({
            where: {
                id_ruangan: id_ruangan, 
                status: 'Disetujui',
                // Membandingkan kolom tanggal_sewa dengan parameter tanggal dari URL
                tanggal_sewa: tanggal_sewa 
            },
            // Hanya ambil waktu mulai dan waktu selesai
            attributes: ['waktu_mulai', 'waktu_selesai', 'kegiatan'], 
            order: [['waktu_mulai', 'ASC']],
        });
        
        // 2. Format hasil
        const dataSlotTerisi = jadwalDetail.map(pengajuan => ({
            mulai: pengajuan.waktu_mulai,
            selesai: pengajuan.waktu_selesai,
            kegiatan: pengajuan.kegiatan 
        }));
        
        return res.status(200).json({
            success: true,
            message: `Slot terisi untuk ruangan pada ${tanggal_sewa}.`,
            data_slot_terisi: dataSlotTerisi
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const tambahPengajuan = async (req, res) => {
    const UPLOAD_DIR = 'public/uploads/suratPeminjaman';
    const surat_peminjaman = req.uploadedFileName || (req.file ? req.file.filename : null);
    const transaction = await sequelize.transaction();
    try {
        const id_user = req.id_user; 
        const {id_ruangan} = req.params;
        const {
            tanggal_sewa,
            waktu_mulai,
            waktu_selesai,
            organisasi_komunitas,
            kegiatan,
            barang_dipinjam
        } = req.body;

        let daftarBarang = [];
        if (barang_dipinjam) {
            try {
                const parsedObject = JSON.parse(barang_dipinjam);
                if (parsedObject && Array.isArray(parsedObject.barang)) {
                    
                    daftarBarang = parsedObject.barang;

                } else {
                    if (surat_peminjaman) {
                        const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                        await fs.promises.unlink(filePath);
                    }
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Format data barang_dipinjam tidak valid: Key 'barang' tidak ditemukan atau bukan array."
                    });
                }
            } catch (e) {
                if (surat_peminjaman) {
                    const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                    await fs.promises.unlink(filePath);
                }
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Format data barang_dipinjam tidak valid (gagal parsing JSON)."
                });
            }
        }

        if (!id_ruangan || !tanggal_sewa || !waktu_mulai || !waktu_selesai || !kegiatan || !surat_peminjaman) {
            console.log(id_ruangan , tanggal_sewa , waktu_mulai , waktu_selesai , kegiatan , surat_peminjaman);
            
            if (surat_peminjaman) {
                const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                await fs.promises.unlink(filePath); // Gunakan fs.promises untuk async/await
            }

            return res.status(400).json({
                success: false,
                message: "Semua kolom wajib diisi, termasuk surat peminjaman."
            });
        }
        
        // --- PENCEGAHAN OVERLAP JADWAL ---
        const existingPengajuan = await modelPengajuan.findOne({
            where: {
                id_ruangan: id_ruangan,
                status: { [Op.in]: ['Disetujui'] },
                tanggal_sewa: tanggal_sewa, 
                [Op.and]: [
                    { waktu_mulai: { [Op.lt]: waktu_selesai } }, 
                    { waktu_selesai: { [Op.gt]: waktu_mulai } }  
                ]
            }
        });

        if (existingPengajuan) {
            
            // 🔥 HAPUS FILE JIKA TERJADI KONFLIK JADWAL (ROLLBACK)
            if (surat_peminjaman) {
                const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                await fs.promises.unlink(filePath);
            }
            
            return res.status(400).json({
                success: false,
                message: "Ruangan sudah dipesan (bertentangan) pada waktu tersebut.",
            });
        }
        
        // --- BUAT PENGAJUAN BARU ---
        const newPengajuan = await modelPengajuan.create({
            id_user: id_user,
            id_ruangan: id_ruangan,
            tanggal_sewa: tanggal_sewa,
            waktu_mulai: waktu_mulai,
            waktu_selesai: waktu_selesai,
            surat_peminjaman: surat_peminjaman, // Simpan nama file ke DB
            organisasi_komunitas: organisasi_komunitas,
            kegiatan: kegiatan,
            status: 'Disetujui'
        }, { transaction });

        if (daftarBarang.length > 0) {
            const itemsToCreate = daftarBarang.map(item => ({
                id_pengajuan: newPengajuan.id_pengajuan, // FK ke pengajuan utama
                id_barang: item.id_barang,
                jumlah: item.jumlah
            }));

            // BulkCreate ke tabel pengajuan_barang
            await modelPengajuanBarang.bulkCreate(itemsToCreate, { transaction }); 
        }

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil dibuat. Menunggu persetujuan.",
            data: newPengajuan
        });

    } catch (error) {
        console.error("Kesalahan saat menambah pengajuan:", error);
        
        // 🔥 HAPUS FILE JIKA TERJADI KESALAHAN SERVER/DB (ROLLBACK)
        if (surat_peminjaman) {
            try {
                const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                await fs.promises.unlink(filePath);
                console.log(`File ${surat_peminjaman} berhasil dihapus dari server.`);
            } catch (unlinkError) {
                console.error("Gagal menghapus file yang diunggah:", unlinkError);
            }
        }
        
        return res.status(500).json({
            success: false,
            message: "Gagal menambah pengajuan (Internal Server Error)"
        });
    }
};

const editPengajuan = async (req, res) => {
    const UPLOAD_DIR = 'public/uploads/suratPeminjaman';
    const surat_peminjaman_baru = req.uploadedFileName || (req.file ? req.file.filename : null);
    const transaction = await sequelize.transaction();
    
    try {
        const id_user = req.id_user; 
        const { id_pengajuan } = req.params;
        
        const {
            tanggal_sewa,
            waktu_mulai,
            waktu_selesai,
            organisasi_komunitas,
            kegiatan,
            barang_dipinjam
        } = req.body;

        if (!id_pengajuan) {
            // Rollback jika ada file baru diupload dan id_pengajuan tidak ada
            if (surat_peminjaman_baru) {
                await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
            }
            return res.status(400).json({ success: false, message: "ID Pengajuan harus disertakan." });
        }
        
        const pengajuanToEdit = await modelPengajuan.findByPk(id_pengajuan, { transaction });

        if (!pengajuanToEdit) {
            // Hapus file baru jika data lama tidak ditemukan
            if (surat_peminjaman_baru) {
                await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
            }
            return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan." });
        }
        
        // Data yang akan di-update (mengambil nilai lama jika nilai baru tidak disediakan)
        const updatedFields = {
            id_ruangan: pengajuanToEdit.id_ruangan,
            tanggal_sewa: tanggal_sewa || pengajuanToEdit.tanggal_sewa,
            waktu_mulai: waktu_mulai || pengajuanToEdit.waktu_mulai,
            waktu_selesai: waktu_selesai || pengajuanToEdit.waktu_selesai,
            organisasi_komunitas: organisasi_komunitas || pengajuanToEdit.organisasi_komunitas,
            kegiatan: kegiatan || pengajuanToEdit.kegiatan,
            status: 'Disetujui' 
        };

        // Surat Peminjaman: Gunakan surat baru jika diunggah, jika tidak, gunakan surat lama
        const surat_peminjaman_lama = pengajuanToEdit.surat_peminjaman;
        if (surat_peminjaman_baru) {
            updatedFields.surat_peminjaman = surat_peminjaman_baru;
        }  else {
             updatedFields.surat_peminjaman = surat_peminjaman_lama;
        }
        
        let daftarBarang = [];
        if (barang_dipinjam) {
            try {
                const parsedObject = JSON.parse(barang_dipinjam);
                if (parsedObject && Array.isArray(parsedObject.barang)) {
                    daftarBarang = parsedObject.barang;
                } else {
                    // Hapus file baru jika format barang salah
                    if (surat_peminjaman_baru) {
                        await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
                    }
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Format data barang_dipinjam tidak valid: Key 'barang' tidak ditemukan atau bukan array."
                    });
                }
            } catch (e) {
                 // Hapus file baru jika gagal parsing JSON
                if (surat_peminjaman_baru) {
                    await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
                }
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Format data barang_dipinjam tidak valid (gagal parsing JSON)."
                });
            }
        }
        
        // ------------------------------------------
        // PENCEGAHAN OVERLAP JADWAL
        // ------------------------------------------
        const existingPengajuanOverlap = await modelPengajuan.findOne({
            where: {
                // TIDAK termasuk ID pengajuan yang sedang di-edit
                id_pengajuan: { [Op.ne]: id_pengajuan }, 
                id_ruangan: pengajuanToEdit.id_ruangan, // Gunakan id_ruangan dari data lama (atau dari body jika diizinkan diubah)
                status: { [Op.in]: ['Disetujui'] },
                tanggal_sewa: updatedFields.tanggal_sewa, // Cek tanggal baru/lama
                [Op.and]: [
                    { waktu_mulai: { [Op.lt]: updatedFields.waktu_selesai } }, 
                    { waktu_selesai: { [Op.gt]: updatedFields.waktu_mulai } }  
                ]
            }
        });

        if (existingPengajuanOverlap) {
            // HAPUS FILE BARU JIKA TERJADI KONFLIK JADWAL
            if (surat_peminjaman_baru) {
                await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
            }
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Ruangan sudah dipesan (bertentangan) pada waktu tersebut oleh pengajuan lain.",
            });
        }
        
        await pengajuanToEdit.update(updatedFields, { transaction });
        
        // 2. Kelola Barang Dipinjam (Hapus yang lama, buat yang baru)
        await modelPengajuanBarang.destroy({
            where: { id_pengajuan: id_pengajuan }
        }, { transaction });

        if (daftarBarang.length > 0) {
            const itemsToCreate = daftarBarang.map(item => ({
                id_pengajuan: id_pengajuan, // FK ke pengajuan utama
                id_barang: item.id_barang,
                jumlah: item.jumlah
            }));

            // BulkCreate ke tabel pengajuan_barang
            await modelPengajuanBarang.bulkCreate(itemsToCreate, { transaction }); 
        }

        // 3. Commit Transaksi
        await transaction.commit();

        // 4. Hapus Surat Lama SETELAH COMMIT BERHASIL
        if (surat_peminjaman_baru && surat_peminjaman_lama) {
            try {
                const filePath = path.join(UPLOAD_DIR, surat_peminjaman_lama);
                await fs.promises.unlink(filePath);
            } catch (unlinkError) {
                console.warn(`Peringatan: Gagal menghapus file lama ${surat_peminjaman_lama}:`, unlinkError.message);
                // WARNING: Lanjutkan operasi meskipun gagal hapus file lama (karena update DB sudah berhasil)
            }
        }

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil diperbarui. Menunggu persetujuan ulang.",
            data: pengajuanToEdit
        });

    } catch (error) {
        console.error("Kesalahan saat mengedit pengajuan:", error);
        await transaction.rollback(); // Rollback transaksi jika ada kegagalan
        
        // HAPUS FILE BARU JIKA TERJADI KESALAHAN SERVER/DB
        if (surat_peminjaman_baru) {
            try {
                const filePath = path.join(UPLOAD_DIR, surat_peminjaman_baru);
                await fs.promises.unlink(filePath);
            } catch (unlinkError) {
                console.error("Gagal menghapus file baru yang diunggah saat rollback:", unlinkError);
            }
        }
        
        return res.status(500).json({
            success: false,
            message: "Gagal mengedit pengajuan (Internal Server Error)"
        });
    }
};

const historyPengajuan = async (req,res)=>{
    try {
        const id_user = req.id_user
        const history = await modelPengajuan.findAll({
            where: {
                id_user: id_user
            },
            include: {
                model: modelRuangan,
                attributes: ['nama_ruangan', 'gambar']
            }
        })

        if (history.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Belum Ada Riwayat Saat Ini"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Riwayat Ditemukan",
            history: history
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const detailHistory = async(req,res)=>{
    try {
        const {id_pengajuan} = req.params
        const history = await modelPengajuan.findAll({
            where: {
                id_pengajuan: id_pengajuan
            },
            include: [{
                model: modelRuangan,
                attributes: ['nama_ruangan', 'gambar']
            },
            {
                model: modelPengajuanBarang,
                attributes: ['id_pengajuan_barang', 'jumlah'],
                include: {
                    model: modelBarang,
                    attributes: ['nama_barang']
                }
            }
            ]
        })

        if (history.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Belum Ada Riwayat Saat Ini"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Riwayat Ditemukan",
            history: history
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const hapusPengajuan = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const id_user = req.id_user; 
        const { id_pengajuan } = req.params;

        if (!id_pengajuan) {
            return res.status(400).json({
                success: false,
                message: "ID Pengajuan harus disertakan dalam parameter."
            });
        }

        const pengajuanToCancel = await modelPengajuan.findByPk(id_pengajuan, { transaction });

        if (!pengajuanToCancel) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Pengajuan tidak ditemukan."
            });
        }
        
        await transaction.commit();
        

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil dihapus.",
            id_pengajuan: id_pengajuan
        });

    } catch (error) {
        console.error("Kesalahan saat menghapus pengajuan:", error);
        await transaction.rollback(); 
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus pengajuan (Internal Server Error)"
        });
    }
};

module.exports ={
    lihatRuangan,
    detailRuangan,
    lihatJadwalRuangan,
    lihatJadwalRuanganPerTanggal,
    tambahPengajuan,
    lihatKetersediaanBarang,
    editPengajuan,
    historyPengajuan,
    detailHistory,
    hapusPengajuan
}