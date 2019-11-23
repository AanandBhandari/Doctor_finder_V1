const express = require("express");
const router = express.Router();
const { hasAuthorization, auth } = require("../../controllers/user/auth");
const {
  profile,
  createProfile,
  getProfile,
  updateProfile,
  addLocation,
  postReview
} = require("../../controllers/user/user");
const { validateGeolocation } = require("../../validator/index");

// user profile
router.get("/user/profile/:id", getProfile);
router.put("/user/profile", auth, createProfile);
router.put("/user/profile/:id", auth, hasAuthorization, updateProfile);
router.put(
  "/user/addGeoLocation/:id/",
  validateGeolocation,
  auth,
  hasAuthorization,
  addLocation
);

// take appointment


// user reviews doctor
router.route("/user/review/:id")
      .post(auth,hasAuthorization,postReview)
// delete user account soon...
router.param("id", profile);
module.exports = router;
