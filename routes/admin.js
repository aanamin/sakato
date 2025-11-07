const express = require('express')
const router = express.Router()
const controllers = require('../controllers/admin')
const middleware = require('../middleware/authentication')
const upload = require('../middleware/upload')

router.post('/ruangan', upload.upload.array('gambar_ruangan'), controllers.tambahRuangan)
router.post('/barang', controllers.tambahRuangan)


module.exports = router