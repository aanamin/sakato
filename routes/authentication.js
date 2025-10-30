const express = require('express')
const router = express.Router()
const controllers = require('../controllers/authentication')
const middleware = require('../middleware/authentication')

router.post('/login', controllers.login)
router.post('/register', controllers.register)
router.post('/update', middleware.verifyToken,controllers.editProfil)


module.exports = router