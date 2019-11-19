const express = require('express')
const router = express.Router()
const { hasAuthorization, auth } = require('../../controllers/hospital/auth')
const { profile, getProfile } = require('../../controllers/hospital/hospital')
const { createProfile} = require('../../controllers/doctor/doctor')
const { validateGeolocation } = require("../../validator/index");

// hospital profile
// router.get('/hospital/profile/:id', getProfile)
router.put('/doctor/profile', auth, createProfile)
// router.put('/hospital/profile/:id', auth, hasAuthorization, updateProfile)
// router.put('/hospital/addGeoLocation/:id/', validateGeolocation, auth, hasAuthorization, addLocation)
// delete hospital account soon...
// router.param('id', profile)
module.exports = router
