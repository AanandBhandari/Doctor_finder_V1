const User = require("../../models/User");
const Doctor = require("../../models/Doctor");
const Hospital = require("../../models/Hospital");
const OPD = require("../../models/OPD");
const Review = require("../../models/Review");
const Appointment = require("../../models/Appointment");
const Timemanage = require("../../models/Timemanage");
const { calculateDistance, predict } = require("../../helpers");
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
  profile = req.user;
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

exports.getDoctorsByLocation = async (req, res) => {
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
    return res
      .status(400)
      .json({ error: `No doctors found within ${req.query.d} km` });
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
    return res
      .status(400)
      .json({ error: `No doctors found within ${req.query.d} km` });
  }
  res.json(results);
};

exports.getDoctorBySpecialities = async (req, res) => {
  const page = req.query.page || 1;
  const doctors = await Doctor.find({
    specialities: { $regex: req.query.specialities, $options: "i" }
  })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .select("_id name lastname image professionaltitle specialities");
  if (doctors.length === 0) {
    return res.status(400).json({ error: "No doctor found" });
  }
  res.json(doctors);
};
exports.getDoctorByAddress = async (req, res) => {
  const page = req.query.page || 1;
  let hospitals = await Hospital.find({
    address: { $regex: req.query.address, $options: "i" }
  })
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
    return res
      .status(400)
      .json({ error: `No doctors found within ${req.query.d} km` });
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
    .select("_id name lastname image professionaltitle specialities");
  if (doctors.length < 1) {
    return res.status(400).json({ error: "No doctor found" });
  }
  res.json(doctors);
};

// appointment
exports.createApointment = async (req, res) => {
  let { hr, min } = req.body;
  hr = +hr;
  min = +min;
  const opds = await OPD.find({ doctor: req.query.d_id, isAvailable: true });
  if (opds.length < 1) {
    return res.status(400).json({ error: "OPD not available at the moment" });
  }
  // filter if time is inbetween the ranges of opds
  let time = hr + min / 60;
  let opd = opds.filter(opd => {
    return Number(opd.starttime) <= time && Number(opd.endtime) >= time;
  });
  // as filterd opds should be only one
  if (opd.length !== 1) {
    return res.status(400).json({ error: "Please prefer another time" });
  }
  [opd] = opd;
  const { starttime, endtime, _id, timeslot } = opd;
  // now checking for if prefered time is booked or not from Timemanage model
  let appointmentTime = await Timemanage.findOne({
    opd: _id
  });
  if (!appointmentTime) {
    return res.status(400).json({ error: "Time not available at the moment" });
  }
  // we need index of bookedTime that matchs prefered Date
  let index = appointmentTime.bookedTime.findIndex(a => {
    let date = a.date.toISOString().slice(0, 10);
    return date === req.body.date;
  });
  if (index === -1) {
    return res.status(400).json({ error: "Date not available" });
  }
  // need to loop over on those time slot available for the day
  // nd check if prefered time is already booked or not
  // if not booked create appointment
  const preferedTime = (hr - Number(starttime)) * 60 + min;
  // increasing range according to opd timeslot
  let start = 0;
  let end = Number(timeslot);
  let len = appointmentTime.bookedTime[index].availabletimeslot.length;
  for (let i = 0; i < len; i++) {
    if (i > 0) {
      start = end;
      end += Number(timeslot);
    }
    if (end >= preferedTime && start <= preferedTime) {
      // tyo booked time ko tyo time slot 0 chavane matra appointment lina milne
      if (appointmentTime.bookedTime[index].availabletimeslot[i] === 0) {
        // appointment can be done now at prefered time
        appointmentTime.bookedTime[index].availabletimeslot.set(i, "1");
        let newAppointment = {
          date: req.body.date,
          preferedtime: start + Number(starttime) * 60,
          user: req.user._id,
          opd: _id,
          hospital: opd.hospital,
          doctor: opd.doctor,
          status: "inactive"
        };
        newAppointment = new Appointment(newAppointment);
        newAppointment = await newAppointment.save();
        newAppointment = await newAppointment
          .populate("hospital", "-salt -password -createdAt")
          .populate(
            "doctor",
            "_id name lastname email professionaltitle specialities"
          )
          .execPopulate();
        await appointmentTime.save();
        res.json(newAppointment);
        break;
      } else {
        res.status(400).json({ error: "It has already been booked" });
        break;
      }
    }
  }
};

exports.getAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate("hospital", "-salt -password -createdAt")
    .populate(
      "doctor",
      " _id name lastname email professionaltitle specialities"
    );
  if (!appointments) {
    return res.status(400).json({ error: "No appointments found" });
  }
  res.json(appointments);
};
exports.getAppointment = async (req, res) => {
  const appointments = await Appointment.findById(req.query.a_id)
    .populate("hospital", "-salt -password -createdAt")
    .populate(
      "doctor",
      " _id name lastname email professionaltitle specialities"
    );
  if (!appointments) {
    return res.status(400).json({ error: "No appointments found" });
  }
  res.json(appointments);
};

exports.deleteAppointment = async (req, res) => {
  let appointment = await Appointment.findById(req.query.a_id).populate(
    "opd",
    "timeslot starttime"
  );
  if (!appointment) {
    return res.status(400).json({ error: "no appointment found" });
  }
  let appointmentTime = await Timemanage.findOne({
    opd: appointment.opd
  });
  if (!appointmentTime) {
    return res.status(400).json({ error: "Time slots are not available" });
  }
  // we need index of bookedDate
  let bookedDate = appointment.date.toISOString().slice(0, 10);
  let index = appointmentTime.bookedTime.findIndex(a => {
    let date = a.date.toISOString().slice(0, 10);
    return date === bookedDate;
  });
  if (index === -1) {
    return res.status(400).json({ error: "Invalid Date" });
  }
  // need to work on this index
  const availabletimeslotIndex =
    (appointment.preferedtime - appointment.opd.starttime * 60) /
    appointment.opd.timeslot;
  appointmentTime.bookedTime[index].availabletimeslot.set(
    availabletimeslotIndex,
    "0"
  );
  await appointment.remove();
  await appointmentTime.save();
  res.json({ msg: "sucessfully removed appointment" });
};

exports.test = async (req, res) => {
  let today = new Date().toISOString().split('T')[0]
  let timeManage = await Timemanage.find({ "bookedTime.date": today })
  // timeManage = timeManage.map((t, i) => {
  //   return t.bookedTime.map((b, j) => {
  //     if (b.date.toISOString().split('T')[0] === today) {
  //       b.availabletimeslot.map(t => {
  //         if (t === 0) {
  //           t = null
  //         }
  //       })
  //       // console.log(b);
  //     }
  //   })
  // })
  for (let i = 0; i < timeManage.length; i++) {
    const element = timeManage[i];
    for (let j = 0; j < element.bookedTime.length; j++) {
      const bt = element.bookedTime[j];
      if(bt.date.toISOString().split('T')[0]===today){
        for (let k = 0; k < bt.availabletimeslot.length; k++) {
          if (bt.availabletimeslot[k]===0) {
            console.log(bt.availabletimeslot[k]);
            bt.availabletimeslot.set(k,null)
          }
          
        }
      }
      
    }
    
    await element.save()
  }
  // console.log('---timemanage----');
  res.json(timeManage);
};

// review a doctor
exports.postReview = async (req, res) => {
  const doctor = await Doctor.findById(req.query.d_id);
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found with this id" });
  }
  if (req.body.star>5 || req.body.star<1) {
    return res.status(400).json({ error: "Rating should be in range of 0 and 5" });
  }
  let newReview = {
    user: req.user._id,
    doctor: doctor._id,
    comment: req.body.comment,
    star: req.body.star
  };
  newReview = new Review(newReview);
  let savedReview = await newReview.save();
  res.json(savedReview);
};

exports.getReviews = async (req, res) => {
  const page = req.query.page || 1;
  const doctor = await Doctor.findById(req.query.d_id);
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found with this id" });
  }
  const reviews = await Review.find({doctor: doctor._id}).populate('user', 'name lastname')
    .skip(perPage * page - perPage)
    .limit(perPage)
  if (reviews.length === 0) {
    return res.status(400).json({ error: "No reviews found" });
  }
  res.json(reviews);
};
exports.averageRating = async(req,res) => {
  const doctor = await Doctor.findById(req.query.d_id);
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found with this id" });
  }
  let stars = await Review.find({ doctor: doctor._id }).select('star');
  let fiveStars=0,fourStars=0,threeStars=0,twoStars=0,oneStars=0;
  stars.forEach(s =>{
    if (s.star === 5) fiveStars += 1
    if (s.star === 4) fourStars += 1
    if (s.star === 3) threeStars += 1
    if (s.star === 2) twoStars += 1
    if (s.star === 1) oneStars += 1
  })
  let totalRatingUsers = (fiveStars + fourStars + threeStars + twoStars + oneStars)
  let averageStar = (5*fiveStars + 4*fourStars + 3*threeStars + 2*twoStars + oneStars) / totalRatingUsers
                    
  stars = {
    fiveStars,
    fourStars,
    threeStars,
    twoStars,
    oneStars,
    averageStar,
    totalRatingUsers
  }
  res.json(stars)
}
