const express = require('express')
const router = express.Router()
const { hasAuthorization, auth } = require('../../controllers/hospital/auth')
const { profile, createProfile, getProfile , updateProfile, addLocation} = require('../../controllers/hospital/hospital')
const { validateGeolocation } = require("../../validator/index");

// hospital profile
router.get('/hospital/profile/:id',getProfile)
router.put('/hospital/profile', auth, createProfile)
router.put('/hospital/profile/:id', auth, hasAuthorization ,updateProfile)
router.put('/hospital/addGeoLocation/:id/', validateGeolocation, auth, hasAuthorization, addLocation)
// delete hospital account soon...
router.param('id',profile)
module.exports = router
