module.exports = {
    predict: require("./predict").predict,
    uploadDoctorPhoto: require("./multer").uploadDoctorPhoto,
    calculateDistance: require("./geoDistance").calculateDistance,
    emailVerify: require("./emailVerify").verifyEmail,
    dbConnection: require("./dbConnection"),
    apiRequest: require("./apiRequest"),
    every24Hr: require("./every24Hr")
}