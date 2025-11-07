const user = require('./user')
const pengajuan = require('./pengajuan')
const barang = require('./barang')
const ruangan = require('./ruangan')
const pengajuan_barang = require ('./pengajuan_barang')
const review = require ('./review')
const gambar_ruangan = require ('./gambar_ruangan')

user.hasMany(pengajuan,{foreignKey: 'id_user'});
pengajuan.belongsTo(user,{foreignKey: 'id_user'});

ruangan.hasMany(pengajuan,{foreignKey: 'id_ruangan'});
pengajuan.belongsTo(ruangan,{foreignKey: 'id_ruangan'});

barang.hasMany(pengajuan_barang,{foreignKey: 'id_barang'});
pengajuan_barang.belongsTo(barang,{foreignKey: 'id_barang'});

pengajuan.hasMany(pengajuan_barang,{foreignKey: 'id_pengajuan'});
pengajuan_barang.belongsTo(pengajuan,{foreignKey: 'id_pengajuan'});

pengajuan.hasMany(review,{foreignKey: 'id_pengajuan'});
review.belongsTo(pengajuan,{foreignKey: 'id_pengajuan'});

ruangan.hasMany(gambar_ruangan,{foreignKey: 'id_ruangan'});
gambar_ruangan.belongsTo(ruangan,{foreignKey: 'id_ruangan'});



