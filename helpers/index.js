module.exports = {
    // runEveryMidnight: require("./misc").runEveryMidnight,
    // checkDateAvailability: require("./misc").checkDateAvailability,
    // errorHandler: require("./dbErrorHandler").errorHandler,
    predict: require("./predict").predict,
    uploadDoctorPhoto: require("./multer").uploadDoctorPhoto,
    calculateDistance: require("./geoDistance").calculateDistance,
    emailVerify: require("./emailVerify").verifyEmail,
    dbConnection: require("./dbConnection"),
    apiRequest: require("./apiRequest")
}