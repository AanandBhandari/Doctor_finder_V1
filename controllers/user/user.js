const User = require("../../models/User");
const Doctor = require("../../models/Doctor");
const Hospital = require("../../models/Hospital");
const OPD = require("../../models/OPD");
const Review = require("../../models/Review");
const Appointment = require("../../models/Appointment");
const Timemanage = require("../../models/Timemanage")
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
  if (results.length === 0) {
    return res.status(400).json({ error: `No doctors found within ${req.query.d} km` });
  }
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
   if (doctors.length < 1) {
     return res.status(400).json({ error: "No doctor found" });
   }
   res.json(doctors);
};

// appointment
exports.createApointment = async(req,res) => {
  let {hr,min} = req.body
  hr = +hr
  min = +min
  const opds = await OPD.find({doctor:req.query.d_id, isAvailable:true})
  if (opds.length < 1) {
    return res.status(400).json({error: 'OPD not available at the moment'})
  }
  let opd = opds.filter(opd =>{
    // console.log(typeof opd.starttime, typeof hr);
    return (Number(opd.starttime)<=hr && Number(opd.endtime)>=hr)
  })

  if (opd.length !== 1) {
    return res.status(400).json({ error: 'Please prefer another time' })
  }
  [opd] = opd
  const {starttime,endtime, _id, timeslot} = opd 
  const appointmentTime = await Timemanage.findOne({opd:_id})
  if (!appointmentTime) {
    return res.json({error: 'Time not available'})
  }
  if (hr-Number(starttime) < 0) {
    return res.json({ error: 'Time not available..' })
  }
  const preferedTime = ((hr - Number(starttime))*60)+min
  let start = 0
  let end = Number(timeslot)
  for (let i = 0; i < appointmentTime.bookedTime.length; i++) {
    if (i>0) {
      start = end
      end += Number(timeslot)
    }
    if (end >= preferedTime && start <= preferedTime) {
      if (appointmentTime.bookedTime[i]===0) {
        // appointment can be done at prefered time
        appointmentTime.bookedTime.set(i,"1")
        let newAppointment = {
          preferedtime : start+Number(starttime)*60,
          user: req.user._id,
          hospital: opd.hospital,
          doctor: opd.doctor,
          status: 'inactive'
        }
        await appointmentTime.save()
        newAppointment = new Appointment(newAppointment)
        newAppointment = await newAppointment.save()
        res.json(newAppointment)
        break;

      } else {
        res.json({ error: 'Time not available...' })
        break;
      }
    }
  }
}

exports.test = async(req,res) => {
  let appointmentTime = await Timemanage.findOneAndUpdate({ opd: req.query.id },{})
  appointmentTime.bookedTime.set(3,"1")
  // res.json(appointmentTime)
  appointmentTime.save((err,result)=>{
    console.log(err);
    console.log(result);
    res.json(result)
  })
}

// review a doctor
exports.postReview = async(req,res) => {
  const doctor = await Doctor.findById(req.query.d_id)
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found with this id" });
  }
  
}
