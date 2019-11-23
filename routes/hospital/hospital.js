const express = require('express')
const router = express.Router()
const { hasAuthorization, auth } = require('../../controllers/hospital/auth')
const {
  profile,
  createProfile,
  getProfile,
  updateProfile,
  addLocation,
  setOPD,
  deleteOPD,
  getOPD,
  getOPDs,
  availability
} = require("../../controllers/hospital/hospital");
const {
  validateGeolocation,
  validateOPD
} = require("../../validator/index");

// hospital profile
router.get('/hospital/profile/:id',getProfile)
router.put('/hospital/profile', auth, createProfile)
router.put('/hospital/profile/:id', auth, hasAuthorization ,updateProfile)
router.put('/hospital/addGeoLocation/:id/', validateGeolocation, auth, hasAuthorization, addLocation)
// delete hospital account soon...

// OPD 
router
  .route("/hospital/opd/:id")
  .post(validateOPD, auth, setOPD) // hospitalle search garcha dr lai ani add to opd garcha then OPd schedule create garcha..
  .delete(auth, hasAuthorization, deleteOPD) //?opd_id
  .get(auth, hasAuthorization, getOPD)
  .patch(auth, hasAuthorization, availability);
router.get('/hospital/opds/:id',auth,hasAuthorization,getOPDs)

router.param('id',profile)
module.exports = router
