const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Direktori penyimpanan gambar
    },
    filename: (req, file, cb) => {
        // Buat nama unik berdasarkan timestamp
        const uniqueSuffix = Date.now();
        // Simpan nama file lengkap ke req untuk akses di controller
        req.uploadedFileName = uniqueSuffix + '-' + file.originalname; 
        cb(null, req.uploadedFileName); // Tentukan nama file yang akan disimpan
    }
});

// Filter untuk hanya mengizinkan gambar (jpeg, jpg, png)
const imageFileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, JPG, PNG) yang diperbolehkan!'));
    }
};

// Inisialisasi multer untuk gambar (menggunakan nama 'upload')
const upload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
    fileFilter: imageFileFilter
});

const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Direktori penyimpanan khusus untuk PDF
        cb(null, 'public/uploads/suratPeminjaman'); 
    },
    filename: (req, file, cb) => {
        // Buat nama unik berdasarkan timestamp
        const uniqueSuffix = Date.now();
        // Simpan nama file lengkap ke req untuk akses di controller
        req.uploadedFileName = uniqueSuffix + '-' + file.originalname; 
        cb(null, req.uploadedFileName); // Tentukan nama file yang akan disimpan
    }
});

// Filter untuk hanya mengizinkan PDF
const pdfFileFilter = (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!'));
    }
};

// Inisialisasi multer untuk PDF
const uploadPDF = multer({
    storage: pdfStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Batas ukuran file 10MB (bisa disesuaikan)
    fileFilter: pdfFileFilter
});

// -----------------------------------

module.exports = {
    upload,    // Ekspor untuk upload gambar (nama 'upload')
    uploadPDF  // Ekspor untuk upload PDF
};