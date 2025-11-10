const express = require('express')
const router = express.Router()
const controllers = require('../controllers/peminjaman')
const middleware = require('../middleware/authentication')
const upload = require('../middleware/upload')

router.get('/ruangan', middleware.verifyToken, controllers.lihatRuangan)
router.post('/barang', middleware.verifyToken, controllers.lihatKetersediaanBarang)
router.post('/barang/:id_pengajuan', middleware.verifyToken, controllers.lihatKetersediaanBarang)
router.get('/ruangan/:id_ruangan', middleware.verifyToken, controllers.detailRuangan)
router.get('/jadwal/:id_ruangan', middleware.verifyToken, controllers.lihatJadwalRuangan)
router.get('/jadwal/:id_ruangan/:tanggal_sewa', middleware.verifyToken, controllers.lihatJadwalRuanganPerTanggal)
router.get('/jadwal/edit/:id_ruangan/:id_pengajuan', middleware.verifyToken, controllers.lihatJadwalRuanganForEdit)
router.get('/jadwal/edit/:id_ruangan/:id_pengajuan/:tanggal_sewa', middleware.verifyToken, controllers.lihatJadwalRuanganPerTanggalForEdit)
router.get('/history', middleware.verifyToken, controllers.historyPengajuan)
router.get('/history/:id_pengajuan', middleware.verifyToken, controllers.detailHistory)
router.post('/:id_ruangan',upload.uploadPDF.single('surat_peminjaman'), middleware.verifyToken, controllers.tambahPengajuan)
router.post('/edit/:id_pengajuan',upload.uploadPDF.single('surat_peminjaman'), middleware.verifyToken, controllers.editPengajuan)
router.post('/delete/:id_pengajuan',upload.uploadPDF.single('surat_peminjaman'), middleware.verifyToken, controllers.hapusPengajuan)


module.exports = router