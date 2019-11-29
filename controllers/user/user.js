const User = require("../../models/User");
const Doctor = require("../../models/Doctor");
const Hospital = require("../../models/Hospital");
const Review = require("../../models/Review");
const {calculateDistance,predict} = require("../../helpers")
const perPage = 10;
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
  let profile = await User.findOne({ _id: req.user._id, phoneno });
  if (profile) {
    return res.status(403).json({
      error: "Profile is already added!"
    });
  }
  profile = req.user
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
  address && (profile.address = address);
  dob && (profile.dob = dob);
  phoneno && (profile.phoneno = phoneno);
  email && (profile.email = email);
  name && (profile.name = name);
  lastname && (profile.lastname = lastname);
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

// get Doctors by geolocation

exports.getDoctorsByLocation = async(req, res) => {
  const page = req.query.page || 1;
  let hospitals = await Hospital.find({
    location: {
      $near: {
        $maxDistance: 1000 * req.query.d,
        $geometry: {
          type: "Point",
          coordinates: req.profile.location.coordinates
        }
      }
    }
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .select("location")
    .lean()
    .populate(
      "doctors",
      "_id name lastname image professionaltitle specialities"
    );
    // res.send(hospitals)
    if (hospitals.length === 0) {
    return res.status(400).json({ error: `No doctors found within ${req.query.d} km` });
  }
  const results = hospitals.filter(el => {
    if (el.doctors.length > 0) {
    el.d = calculateDistance(
      req.profile.location.coordinates[0],
      req.profile.location.coordinates[1],
      el.location.coordinates[0],
      el.location.coordinates[1]
    );
    return el;
      }
  });
  res.json(results);
};

exports.getDoctorBySpecialities = async(req, res) => {
  const page = req.query.page || 1;
  const doctors = await Doctor.find({
    specialities: { $regex: req.query.specialities, $options: "i" }
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .select("_id name lastname image professionaltitle specialities");
    if (doctors.length === 0) {
      return res.status(400).json({error: "No doctor found"})
    }
    res.json(doctors)
};
exports.getDoctorByAddress = async(req, res) => {
  const page = req.query.page || 1;
  let hospitals = await Hospital.find({address: { $regex: req.query.address, $options: "i" }})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .select("address")
    .lean()
    .populate(
      "doctors",
      "_id name lastname image professionaltitle specialities"
    );
    // res.send(hospitals)
    if (hospitals.length === 0) {
    return res.status(400).json({ error: `No doctors found within ${req.query.d} km` });
  }
  console.log(hospitals);
  const results = hospitals.filter(el => el.doctors.length > 0);
  res.json(results);
};
exports.getDoctorBySymptoms = async (req, res) => {
  const result = await predict(req.body.symptoms);
  console.log(result);
  const page = req.query.page || 1;
  const doctors = await Doctor.find({
    specialities: { $regex: result, $options: "i" }
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .select("_id name lastname image professionaltitle specialities")
   if (doctors.length === 0) {
     return res.status(400).json({ error: "No doctor found" });
   }
   res.json(doctors);
};

// review a doctor
exports.postReview = async(req,res) => {
  const doctor = await Doctor.findById(req.query.d_id)
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found with this id" });
  }
  
}
