const express = require('express')
const router = express.Router()
const { hasAuthorization, auth } = require('../../controllers/doctor/auth')
const { createProfile,getProfile,updateProfile, profile, addWorkexp,removeWorkExp,addEdu,removeEdu,addAwards,removeAwards,addTraining,removeTraining, getDoctors,availability} = require('../../controllers/doctor/doctor')
const { validateData } = require("../../validator/index");
const {uploadDoctorPhoto} = require('../../helpers')

// docotor profile
router
  .route("/doctor/profile/:id")
  .get(getProfile)
  .put(auth, hasAuthorization, uploadDoctorPhoto, updateProfile)
  .patch(auth, hasAuthorization, availability);//filps the availability
router.get('/doctor/getdoctors',getDoctors)

router.put('/doctor/profile', auth, uploadDoctorPhoto,createProfile)

router.route("/doctor/workexp/:id")
  .put(auth, validateData, hasAuthorization, addWorkexp)
  .delete(auth,hasAuthorization,removeWorkExp)

router.route("/doctor/edu/:id")
  .put(auth, hasAuthorization, addEdu)
  .delete(auth,hasAuthorization,removeEdu)

router.route("/doctor/training/:id")
  .put(auth, validateData, hasAuthorization, addTraining)
  .delete(auth,hasAuthorization,removeTraining)

router.route("/doctor/award/:id")
  .put(auth, validateData, hasAuthorization, addAwards)
  .delete(auth,hasAuthorization,removeAwards)
// delete docotor account soon...
router.param('id', profile)
module.exports = router
