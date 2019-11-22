const express = require("express");
const router = express.Router();
const {
  signup,
  signin
} = require("../../controllers/user/auth");
const { signupValidator } = require("../../validator/index");

// auth
router.post("/user/signup", signupValidator, signup)
router.post("/user/signin", signin)

module.exports = router;
