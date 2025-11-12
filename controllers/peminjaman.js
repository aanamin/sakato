const response = require('express')
require('dotenv').config()
require('../models/associations')
const sequelize = require('../config/db'); // atau '../config/db' sesuai struktur folder kamu
const modelRuangan = require('../models/ruangan')
const modelGambarRuangan = require('../models/gambar_ruangan')
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

const lihatRuangan = async (req, res) => {
    try {
        const ruangan = await modelRuangan.findAll({
            // Hanya ambil ID dan Nama Ruangan
            attributes: ['id_ruangan', 'nama_ruangan'], 
            
            // Sertakan gambar dari tabel relasi
            include: [{
                model: modelGambarRuangan,       // Harus sesuai dengan alias di models/index.js
                attributes: ['gambar'],    // Hanya ambil nama file gambar
                limit: 1,                  // Batasi hanya 1 gambar yang diambil per ruangan
                required: false            // 'left join' agar ruangan tanpa gambar tetap muncul
            }]
        });

        if (ruangan.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Ruangan Belum Ada",
                ruangan: []
            })
        }

        // Format ulang data agar lebih mudah dikonsumsi di frontend
        const formattedRuangan = ruangan.map(r => ({
            id_ruangan: r.id_ruangan,
            nama_ruangan: r.nama_ruangan,
            // deskripsi: r.deskripsi,
            // Perbaikan utama: Menggunakan (r.GambarRuangan || []) untuk mencegah undefined
            gambar: (r.gambar_ruangans || []).length > 0 ? r.gambar_ruangans[0].gambar : null,
        }));

        return res.status(200).json({
            success: true,
            message: "Ruangan berhasil ditemukan",
            ruangan: formattedRuangan
        })

    } catch (error) {
        console.error("Error saat melihat ruangan:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const lihatKetersediaanBarang = async (req, res) => {
    try {
        // 1. Ambil id_pengajuan dari params
        const idPengajuan = req.params.id_pengajuan;
        const { tanggal_sewa, waktu_mulai, waktu_selesai } = req.body;

        // Validasi input wajib (TETAP SAMA)
        if (!tanggal_sewa || !waktu_mulai || !waktu_selesai) {
            return res.status(400).json({
                success: false,
                message: "Parameter tanggal_sewa, waktu_mulai, dan waktu_selesai wajib diisi."
            });
        }

        // 2. Siapkan Kondisi Pengecualian id_pengajuan
        let pengajuanWhereClause = {
            tanggal_sewa,
            status: 'Disetujui',
            [Op.and]: [
                { waktu_mulai: { [Op.lt]: waktu_selesai } },
                { waktu_selesai: { [Op.gt]: waktu_mulai } },
            ]
        };

        // Jika id_pengajuan tersedia (misalnya, saat pengeditan), tambahkan pengecualian ke WHERE clause.
        if (idPengajuan) {
            pengajuanWhereClause.id_pengajuan = {
                [Op.ne]: idPengajuan // Mengecualikan id_pengajuan saat ini
            };
            console.log(`Mengecualikan Pengajuan ID: ${idPengajuan} dari perhitungan stok terpakai.`);
        }

        // Query barang beserta stok yang masih tersedia
        const barangTersedia = await modelBarang.findAll({
            attributes: [
                'id_barang',
                'nama_barang',
                'stok_tersedia',
                [
                    // MENGHITUNG STOK TERSEDIA SAAT INI
                    modelBarang.sequelize.literal('`barang`.`stok_tersedia` - COALESCE(COUNT(`pengajuan_barangs`.`id_barang`), 0)'),
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
                            // 3. Gunakan klausa WHERE yang sudah disiapkan
                            where: pengajuanWhereClause,
                            required: true
                        }
                    ]
                }
            ],
            where: {
                stok_tersedia: { [Op.gt]: 0 }
            },
            group: ['barang.id_barang', 'barang.nama_barang', 'barang.stok_tersedia'], // Tambahkan kolom non-agregasi ke GROUP BY
            // KLAUSA HAVING
            having: modelBarang.sequelize.literal('`barang`.`stok_tersedia` - COALESCE(COUNT(`pengajuan_barangs`.`id_barang`), 0) > 0'),
            order: [['nama_barang', 'ASC']]
        });

        // Bagian hasil (TETAP SAMA)
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
            },
            include:[{
                model: modelGambarRuangan,
                attributes: ['gambar']
            }]
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
            attributes: ['tanggal_sewa', 'waktu_mulai', 'waktu_selesai', 'organisasi_komunitas'], // Hanya ambil kolom yang dibutuhkan
            include: [{
                model: modelRuangan,
                attributes: ['id_ruangan', 'nama_ruangan']
            }],
            raw: true // Untuk mendapatkan data object sederhana
        });

        if (jadwalAktif.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Tidak ada jadwal booking aktif untuk ruangan ini.",
                ruangan: {},
                tanggal_terbooking: [],
                detail_booking_per_tanggal: {} // Tambahkan properti ini
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
        const detailBookingPerTanggal = {}; // Untuk detail booking seperti di gambar
        jadwalAktif.forEach(booking => {
            
            // --- PERBAIKAN DI SINI ---
            const tanggal = booking.tanggal_sewa; // Ambil seluruh string 'YYYY-MM-DD'
            // --- AKHIR PERBAIKAN ---
            
            const durasi = hitungDurasiBooking(booking.waktu_mulai, booking.waktu_selesai);
            const waktuMulaiTampilan = booking.waktu_mulai.substring(0, 5); // Ambil HH:MM
            const waktuSelesaiTampilan = booking.waktu_selesai.substring(0, 5); // Ambil HH:MM
            const jamTampilan = `${waktuMulaiTampilan} - ${waktuSelesaiTampilan}`;

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
            if (!detailBookingPerTanggal[tanggal]) {
                // 2. Jika belum ada, inisialisasi sebagai array kosong []
                detailBookingPerTanggal[tanggal] = [];
            }
            
            detailBookingPerTanggal[tanggal].push({
                // Perhatikan bahwa id_pengajuan tidak ada di attributes, ini hanya contoh visual
                // Anda bisa menambahkan id_pengajuan jika diperlukan
                organisasi_komunitas: booking.organisasi_komunitas,
                waktu_booking: jamTampilan,
            });
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
            // Data ini digunakan untuk menandai tanggal di kalender (Status Full/Partial)
            tanggal_terbooking: tanggalUntukKalender, 
            // Data ini digunakan untuk menampilkan detail booking saat tanggal diklik
            detail_booking_per_tanggal: detailBookingPerTanggal
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

const lihatJadwalRuanganPerTanggalForEdit = async (req, res) => {
    try {
        const { id_ruangan, tanggal_sewa, id_pengajuan } = req.params; 
        
        const jadwalDetail = await modelPengajuan.findAll({
            where: {
                id_pengajuan: {
                    [Op.ne]: id_pengajuan
                },
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
            barang_dipinjam // Ini diasumsikan berisi JSON string yang di dalamnya ada array ID barang
        } = req.body;
        console.log(barang_dipinjam);
        
        let daftarBarangIDs = []; // Diubah namanya untuk mencerminkan hanya menyimpan ID barang
        if (barang_dipinjam) {
            try {
                // Asumsi: barang_dipinjam adalah JSON string yang berisi { "barang": ["id_barang_1", "id_barang_2", ...] }
                const parsedObject = JSON.parse(barang_dipinjam);
                
                // PERUBAHAN UTAMA: Hanya mengambil array ID barang
                if (parsedObject && Array.isArray(parsedObject.barang)) {
                    // Kita asumsikan 'parsedObject.barang' sekarang berisi array ID barang, BUKAN objek {id_barang, jumlah}
                    daftarBarangIDs = parsedObject.barang;
                    
                } else {
                    if (surat_peminjaman) {
                        const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                        await fs.promises.unlink(filePath);
                    }
                    console.log("Format data barang_dipinjam tidak valid: Key 'barang' tidak ditemukan atau bukan array ID barang.");
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Format data barang_dipinjam tidak valid: Key 'barang' tidak ditemukan atau bukan array ID barang."
                    });
                }
            } catch (e) {
                if (surat_peminjaman) {
                    const filePath = path.join(UPLOAD_DIR, surat_peminjaman);
                    await fs.promises.unlink(filePath);
                }
                await transaction.rollback();
                console.log("Format data barang_dipinjam tidak valid (gagal parsing JSON).");
                
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
                await fs.promises.unlink(filePath); 
            }

            await transaction.rollback(); // Tambahkan rollback di sini juga
            return res.status(400).json({
                success: false,
                message: "Semua kolom wajib diisi, termasuk surat peminjaman."
            });
        }
        
        // --- PENCEGAHAN OVERLAP JADWAL (TETAP SAMA) ---
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
            await transaction.rollback(); // Tambahkan rollback di sini
            return res.status(400).json({
                success: false,
                message: "Ruangan sudah dipesan (bertentangan) pada waktu tersebut.",
            });
        }
        
        // --- BUAT PENGAJUAN BARU (TETAP SAMA) ---
        const newPengajuan = await modelPengajuan.create({
            id_user: id_user,
            id_ruangan: id_ruangan,
            tanggal_sewa: tanggal_sewa,
            waktu_mulai: waktu_mulai,
            waktu_selesai: waktu_selesai,
            surat_peminjaman: surat_peminjaman, 
            organisasi_komunitas: organisasi_komunitas,
            kegiatan: kegiatan,
            status: 'Disetujui' 
        }, { transaction });

        // PERUBAHAN KEDUA UTAMA: Menyesuaikan BulkCreate
        if (daftarBarangIDs.length > 0) {
            const itemsToCreate = daftarBarangIDs.map(id_barang => ({
                id_pengajuan: newPengajuan.id_pengajuan, // FK ke pengajuan utama
                id_barang: id_barang,
                // Kolom 'jumlah' DIHAPUS karena tidak ada di tabel pengajuan_barang
            }));

            // BulkCreate ke tabel pengajuan_barang
            await modelPengajuanBarang.bulkCreate(itemsToCreate, { transaction }); 
        }

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil dibuat",
            data: newPengajuan
        });

    } catch (error) {
        console.error("Kesalahan saat menambah pengajuan:", error);
        
        // Pastikan rollback dilakukan jika terjadi kesalahan
        await transaction.rollback(); 

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

const lihatJadwalRuanganForEdit = async (req,res)=>{
    const JAM_OPERASIONAL_MULAI = 7; 
    const JAM_OPERASIONAL_SELESAI = 17;
    const TOTAL_JAM_OPERASIONAL = JAM_OPERASIONAL_SELESAI - JAM_OPERASIONAL_MULAI; // 10 jam
    try {
        const {id_pengajuan, id_ruangan} =req.params
        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0); 
        const batasTanggal = new Date(hariIni);
        batasTanggal.setMonth(batasTanggal.getMonth() + 6); // Ambil data 6 bulan ke depan

        const jadwal = await modelPengajuan.findAll({
            where:{
                id_pengajuan:{
                    [Op.ne]: id_pengajuan
                },
                id_ruangan: id_ruangan,
                status: 'Disetujui',
                tanggal_sewa: {
                    [Op.gte]: hariIni,
                    [Op.lte]: batasTanggal
                }
            },
            attributes: ['tanggal_sewa', 'waktu_mulai', 'waktu_selesai', 'organisasi_komunitas'], // Hanya ambil kolom yang dibutuhkan
            include: [{
                model: modelRuangan,
                attributes: ['id_ruangan', 'nama_ruangan']
            }],
            raw: true // Untuk mendapatkan data object sederhana
        })

         const hitungDurasiBooking = (waktu_mulai, waktu_selesai) => {
            const start = new Date(`2000/01/01 ${waktu_mulai}`);
            const end = new Date(`2000/01/01 ${waktu_selesai}`);
            // Menghitung selisih waktu dalam jam (asumsi jam_mulai dan jam_selesai adalah string 'HH:MM:SS')
            const durasiMs = end.getTime() - start.getTime();
            return durasiMs / (1000 * 60 * 60); 
        };

        const bookingPerTanggal = {};
        const detailBookingPerTanggal = {}; // Untuk detail booking seperti di gambar
        jadwal.forEach(booking => {
            
            // --- PERBAIKAN DI SINI ---
            const tanggal = booking.tanggal_sewa; // Ambil seluruh string 'YYYY-MM-DD'
            // --- AKHIR PERBAIKAN ---
            
            const durasi = hitungDurasiBooking(booking.waktu_mulai, booking.waktu_selesai);
            const waktuMulaiTampilan = booking.waktu_mulai.substring(0, 5); // Ambil HH:MM
            const waktuSelesaiTampilan = booking.waktu_selesai.substring(0, 5); // Ambil HH:MM
            const jamTampilan = `${waktuMulaiTampilan} - ${waktuSelesaiTampilan}`;

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
            if (!detailBookingPerTanggal[tanggal]) {
                // 2. Jika belum ada, inisialisasi sebagai array kosong []
                detailBookingPerTanggal[tanggal] = [];
            }
            
            detailBookingPerTanggal[tanggal].push({
                // Perhatikan bahwa id_pengajuan tidak ada di attributes, ini hanya contoh visual
                // Anda bisa menambahkan id_pengajuan jika diperlukan
                organisasi_komunitas: booking.organisasi_komunitas,
                waktu_booking: jamTampilan,
            });
        });
         const tanggalUntukKalender = Object.keys(bookingPerTanggal)
            .map(tanggal => ({
                tanggal: tanggal,
                status: bookingPerTanggal[tanggal].status 
            }));

        return res.status(200).json({
            success: true,
            message: "Jadwal Ditemukan",
             tanggal_terbooking: tanggalUntukKalender, 
            // Data ini digunakan untuk menampilkan detail booking saat tanggal diklik
            detail_booking_per_tanggal: detailBookingPerTanggal
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

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
            if (surat_peminjaman_baru) {
                 await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
             }
             await transaction.rollback();
             return res.status(400).json({ success: false, message: "ID Pengajuan harus disertakan." });
        }
        
        const pengajuanToEdit = await modelPengajuan.findByPk(id_pengajuan, { transaction });

        if (!pengajuanToEdit) {
            if (surat_peminjaman_baru) {
                 await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
             }
             await transaction.rollback();
             return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan." });
        }
        
        const updatedFields = {
            id_ruangan: pengajuanToEdit.id_ruangan,
            tanggal_sewa: tanggal_sewa || pengajuanToEdit.tanggal_sewa,
            waktu_mulai: waktu_mulai || pengajuanToEdit.waktu_mulai,
            waktu_selesai: waktu_selesai || pengajuanToEdit.waktu_selesai,
            organisasi_komunitas: organisasi_komunitas || pengajuanToEdit.organisasi_komunitas,
            kegiatan: kegiatan || pengajuanToEdit.kegiatan,
            status: 'Disetujui'
        };

        const surat_peminjaman_lama = pengajuanToEdit.surat_peminjaman;
        if (surat_peminjaman_baru) {
            updatedFields.surat_peminjaman = surat_peminjaman_baru;
        }  else {
             updatedFields.surat_peminjaman = surat_peminjaman_lama;
        }
        
        let daftarBarangIDs = []; 
        if (barang_dipinjam) {
            try {
                // Asumsi: barang_dipinjam adalah JSON string yang berisi { "barang": ["id_barang_1", "id_barang_2", ...] }
                const parsedObject = JSON.parse(barang_dipinjam);
                
                if (parsedObject && Array.isArray(parsedObject.barang)) {
                    // Hanya mengambil array ID barang (sesuai tambahPengajuan)
                    daftarBarangIDs = parsedObject.barang; 

                } else {
                    if (surat_peminjaman_baru) {
                        await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
                    }
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Format data barang_dipinjam tidak valid: Key 'barang' tidak ditemukan atau bukan array ID barang."
                    });
                }
            } catch (e) {
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

        const existingPengajuanOverlap = await modelPengajuan.findOne({
            where: {
                id_pengajuan: { [Op.ne]: id_pengajuan }, 
                id_ruangan: pengajuanToEdit.id_ruangan, 
                status: { [Op.in]: ['Disetujui'] },
                tanggal_sewa: updatedFields.tanggal_sewa, 
                [Op.and]: [
                    { waktu_mulai: { [Op.lt]: updatedFields.waktu_selesai } }, 
                    { waktu_selesai: { [Op.gt]: updatedFields.waktu_mulai } }  
                ]
            }
        });

        if (existingPengajuanOverlap) {
            if (surat_peminjaman_baru) {
                await fs.promises.unlink(path.join(UPLOAD_DIR, surat_peminjaman_baru));
            }
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Ruangan sudah dipesan (bertentangan) pada waktu tersebut oleh pengajuan lain.",
            });
        }
        
        // 1. Update data pengajuan utama
        await pengajuanToEdit.update(updatedFields, { transaction });
        
        // 2. Kelola Barang Dipinjam (Hapus yang lama, buat yang baru)
        await modelPengajuanBarang.destroy({
            where: { id_pengajuan: id_pengajuan }
        }, { transaction });

        // Buat data barang baru
        if (daftarBarangIDs.length > 0) {
            const itemsToCreate = daftarBarangIDs.map(id_barang => ({ // Iterasi langsung pada ID
                id_pengajuan: id_pengajuan, 
                id_barang: id_barang, 
            }));

            await modelPengajuanBarang.bulkCreate(itemsToCreate, { 
                transaction
            }); 
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
            }
        }

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil diperbarui.",
            data: pengajuanToEdit
        });

    } catch (error) {
        console.error("Kesalahan saat mengedit pengajuan:", error);
        await transaction.rollback(); 
        
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
            include: [{
                model: modelRuangan, // Include Ruangan
                attributes: ['nama_ruangan', 'id_ruangan'], 
                include: [{
                    model: modelGambarRuangan, // Include Gambar Ruangan
                    attributes: ['gambar'],
                    limit: 1, 
                    required: false 
                }]
            }]
        })

        if (history.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Belum Ada Riwayat Saat Ini"
            })
        }
        const formattedHistory = history.map(item => {
            // Dapatkan objek Ruangan (sesuai alias di atas, misal item.Ruangan)
            const ruanganData = item.ruangan; 
            

            // Kembalikan objek yang diformat
            return {
                id_pengajuan: item.id_pengajuan, // Asumsi ada field ini
                id_user: item.id_user,
                id_ruangan: item.id_ruangan,
                tanggal_sewa: item.tanggal_sewa, // Asumsi ada field ini
                waktu_mulai: item.waktu_mulai, // Asumsi ada field ini
                waktu_selesai: item.waktu_selesai, // Asumsi ada field ini
                waktu_selesai: item.waktu_selesai, // Asumsi ada field ini
                surat_peminjaman: item.surat_peminjaman, // Asumsi ada field ini
                organisasi_komunitas: item.organisasi_komunitas, // Asumsi ada field ini
                kegiatan: item.kegiatan, // Asumsi ada field ini
                status: item.status, // Asumsi ada field ini
                tujuan: item.tujuan, // Asumsi ada field ini
                created_at: item.created_at, // Asumsi ada field ini
                updated_at: item.updated_at, // Asumsi ada field ini
                
                // Detail Ruangan
                ruangan: {
                    
                    nama_ruangan: ruanganData?.nama_ruangan,
                    gambar: (ruanganData?.gambar_ruangans || []).length > 0 ? ruanganData.gambar_ruangans[0].gambar : null, // Nama gambar utama, bukan array
                },
                // Hapus properti relasi yang tidak diinginkan di level root
                // Jika ada properti lain di modelPengajuan yang ingin Anda ambil, masukkan di sini
            };
        });
        return res.status(200).json({
            success: true,
            message: "Riwayat Ditemukan",
            history: formattedHistory
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
            attributes:['surat_peminjaman', 'organisasi_komunitas','kegiatan',],
            include: [{
                model: modelRuangan,
                attributes: ['nama_ruangan']
            },
            {
                model: modelPengajuanBarang,
                attributes: ['id_pengajuan_barang', 'id_barang'],
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

        const pengajuanToCancel = await modelPengajuan.findOne({
            where: {
                id_pengajuan: id_pengajuan,
                id_user: id_user, // Pastikan hanya pemilik yang bisa membatalkan
            },
            transaction 
        });

        
        if (!pengajuanToCancel) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Pengajuan tidak ditemukan."
            });
        }
        await pengajuanToCancel.update({ 
            status: 'Dibatalkan',
        }, { transaction });
        
        await transaction.commit();
        

        return res.status(200).json({
            success: true,
            message: "Pengajuan peminjaman berhasil Dibatalkan.",
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
    hapusPengajuan,
    lihatJadwalRuanganForEdit,
    lihatJadwalRuanganPerTanggalForEdit,

}