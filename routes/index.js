const server = {}
const auth = require('./authentication')
const order = require('./peminjaman')
const admin = require('./admin')
const review = require('./review')

server.auth = auth
server.order = order
server.admin = admin
server.review = review
module.exports = server