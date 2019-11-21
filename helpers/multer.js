const path = require("path");
const multer = require("multer");

const doctorPhoto = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/doctor')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

exports.uploadDoctorPhoto = multer({ storage: doctorPhoto }).single("image");