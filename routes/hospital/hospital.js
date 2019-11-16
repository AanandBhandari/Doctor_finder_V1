const express = require('express')
const router = express.Router()
const { hasAuthorization, auth } = require('../../controllers/hospital/auth')
const { profile, createProfile, getProfile , updateProfile} = require('../../controllers/hospital/hospital')
const { signupValidator } = require("../../validator/index");

// hospital profile
router.get('/hospital/profile/:id',getProfile)
router.put('/hospital/profile', auth, createProfile)
router.put('/hospital/profile/:id', auth, hasAuthorization ,updateProfile)
router.param('id',profile)
module.exports = router
