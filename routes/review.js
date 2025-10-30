const express = require('express')
const router = express.Router()
const controllers = require('../controllers/review')
const middleware = require('../middleware/authentication')
const upload = require('../middleware/upload')

router.get('/', middleware.verifyToken, controllers.lihatReview)
router.post('/:id_pengajuan', middleware.verifyToken, controllers.tambahReview)


module.exports = router