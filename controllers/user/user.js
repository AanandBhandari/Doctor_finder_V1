const User = require("../../models/User");
exports.profile = async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password -salt");
  if (!user) {
    return res.status(400).json({ error: "User not found with this id" });
  }
  req.profile = user;
  next();
};

// getProfile
exports.getProfile = async (req, res) => {
  res.json(req.profile);
};

// create profile
exports.createProfile = async (req, res) => {
  const { address, dob, phoneno } = req.body;
  console.log('hello');
  let profile = await User.findOne({ _id: req.user._id, phoneno });
  if (profile) {
    return res.status(403).json({
      error: "Profile is already added!"
    });
  }
  profile = await User.findOne({ _id: req.user._id });
  profile.address = address;
  profile.dob = dob;
  profile.phoneno = phoneno;
  profile = await profile.save();
  profile.salt = undefined;
  profile.password = undefined;
  res.json(profile);
};
// update profile
exports.updateProfile = async (req, res) => {
  const { address, dob, phoneno, email, name, lastname } = req.body;
  let profile = req.profile;
  profile.address = address;
  profile.dob = dob;
  profile.phoneno = phoneno;
  profile.email = email;
  profile.name = name;
  profile.lastname = lastname;
  await profile.save();
    res.json(profile);
};

// add location
exports.addLocation = async (req, res) => {
  const { long, lat } = req.query;
  location = {
    type: "Point",
    coordinates: [long, lat]
  };
  req.profile.location = location;
  const result = await req.profile.save();
  res.json(result.location);
};
