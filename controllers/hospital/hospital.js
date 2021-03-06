const Hospital = require("../../models/Hospital");
const OPD = require("../../models/OPD");
const Doctor = require("../../models/Doctor");
const Timemanage = require("../../models/Timemanage");
const Appointment = require("../../models/Appointment")
exports.profile = async (req, res, next) => {
  const hospital = await Hospital.findById(req.params.id).select(
    "-password -salt"
  );
  if (!hospital) {
    return res.status(400).json({ error: "Hospital not found with this id" });
  }
  req.profile = hospital;
  next();
};

// getProfile
exports.getProfile = async (req, res) => {
  res.json(req.profile);
};

// create profile
exports.createProfile = async (req, res) => {
  const { address, website, phoneno } = req.body;
  let profile = await Hospital.findOne({ _id: req.hospital._id, phoneno });
  if (profile) {
    return res.status(403).json({
      error: "Profile is already added!"
    });
  }
  profile = req.hospital;
  profile.address = address;
  profile.website = website;
  profile.phoneno = phoneno;
  profile = await profile.save();
  profile.salt = undefined;
  profile.password = undefined;
  res.json(profile);
};
// update profile
exports.updateProfile = async (req, res) => {
  const { address, website, phoneno, email, name } = req.body;
  let profile = req.profile;
  address && (profile.address = address);
  website && (profile.website = website);
  phoneno && (profile.phoneno = phoneno);
  email && (profile.email = email);
  name && (profile.name = name);
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

// set OPD
exports.setOPD = async (req, res) => {
  let { startdate, enddate, starttime } = req.body;
  startdate = new Date(startdate);
  enddate = new Date(enddate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let actualStartTime = startdate.getTime() + starttime * 3600000;
  if (actualStartTime < tomorrow) {
    return res
      .status(400)
      .json({
        error:
          "Start date and time should be from at least today and a hour later from now respectively"
      });
  }
  if (startdate.getTime() > enddate.getTime()) {
    return res
      .status(400)
      .json({ error: "Start date should be smaller than end date" });
  }
  const doctor = await Doctor.findById(req.query.d_id);
  if (!doctor) {
    return res.status(400).json({ error: "Doctor not found" });
  }
  if (!doctor.isAvailable) {
    return res
      .status(400)
      .json({ error: "Doctor is not available at the moment" });
  }
  const opds = await OPD.find({ doctor: doctor._id });
  async function Init0(newOPD) {
    const { starttime, endtime, _id, timeslot, startdate, enddate } = newOPD;
    // find no of days to init booked time with zero for those days
    const getMillis =
      new Date(enddate).getTime() - new Date(startdate).getTime(); //need to check date without creting new instance
    const noofDays = Math.floor(getMillis / 86400000);
    // find number of available interval for a day
    const noOfTimeInterval =
      ((Number(endtime) - Number(starttime)) * 60) / Number(timeslot);
    let bookedTime = [];
    let StartDate = new Date(startdate);
    for (let i = 0; i <= noofDays; i++) {
      let date = new Date();
      const timeslotPerDay = new Array(noOfTimeInterval).fill(0);
      date.setDate(StartDate.getDate() + i);
      date = date.toISOString().split('T')[0]
      let schedule = {
        date,
        availabletimeslot: timeslotPerDay
      };
      bookedTime.push(schedule);
    }
    let timemanage = {
      opd: _id,
      bookedTime
    };
    timemanage = new Timemanage(timemanage);
    await timemanage.save();
  }
  // checks for available time span
  if (opds.length >= 1) {
    let isAvailable = false;
    for (let i = 0; i < opds.length; i++) {
      let opd = opds[i];
      // check for dates available
      isAvailable =
        (startdate.getTime() > opd.startdate.getTime() &&
          startdate.getTime() > opd.enddate.getTime()) ||
        (startdate.getTime() < opd.startdate.getTime() &&
          enddate.getTime() < opd.startdate.getTime());
      // if date Available then check for available time
      if (!isAvailable) {
        isAvailable =
          (+req.body.starttime > opd.starttime &&
            +req.body.starttime > opd.endtime) ||
          (+req.body.endtime < opd.starttime &&
            +req.body.endtime < opd.endtime);
      }
    }
    if (isAvailable) {
      let newOPD = req.body;
      newOPD.doctor = doctor._id;
      newOPD.hospital = req.hospital._id;
      newOPD = new OPD(newOPD);
      newOPD = await newOPD.save();
      // checks if dr already exits in this hospital
      let isDrExits = req.hospital.doctors.filter(
        dr => dr.toString() == doctor._id.toString()
      );
      if (isDrExits.length < 1) {
        req.hospital.doctors.unshift(doctor._id);
        await req.hospital.save();
      }
      // init available time interval with 0 value in Timemanage
      await Init0(newOPD);
      return res.json(newOPD);
    } else {
      return res.status(400).json({ error: "Time span is not available" });
    }
  } else {
    let newOPD = req.body;
    newOPD.doctor = doctor._id;
    newOPD.hospital = req.hospital._id;
    req.hospital.doctors.unshift(doctor._id);
    await req.hospital.save();
    newOPD = new OPD(newOPD);
    newOPD = await newOPD.save();
    await Init0(newOPD);
    res.json(newOPD);
  }
};

// delete OPD
exports.deleteOPD = async (req, res) => {
  const opd = await OPD.findById(req.query.opd_id);
  if (!opd) {
    return res.status(400).json({ error: "OPD not found" });
  }
  if (opd.hospital.toString() !== req.hospital._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const opdsOfSameDr = await OPD.find({
    hospital: req.hospital._id,
    doctor: opd.doctor
  });
  console.log(opdsOfSameDr, "jjhj");
  if (opdsOfSameDr.length == 1) {
    const removeIndex = req.hospital.doctors.map(doctor =>
      doctor.toString().indexOf(opd.doctor)
    );
    req.hospital.doctors.splice(removeIndex, 1);
    await req.hospital.save();
  }
  await opd.remove();
  await Timemanage.findOneAndDelete({ opd: opd._id });
  res.json({ msg: "OPD removed" });
};

exports.getOPD = async (req, res) => {
  let opd = await OPD.findById(req.query.opd_id).populate(
    "doctor",
    "_id name lastname email professionaltitle image specialities"
  );
  if (!opd) {
    return res.status(400).json({ error: "OPD not found" });
  }
  res.json(opd);
};

exports.getOPDs = async (req, res) => {
  const opds = await OPD.find({ hospital: req.hospital._id }).populate(
    "doctor",
    "_id name lastname email professionaltitle image specialities isAvailable"
  );
  if (!opds) {
    return res.status(400).json({ error: "No OPDs" });
  }
  res.json(opds);
};

exports.getOPDByDoctor = async (req, res) => {
  const opds = await OPD.find({ doctor: req.query.d_id }).populate(
    "doctor",
    "_id isAvailable"
    ).populate('hospital', 'name address location phoneno');
    if (!opds) {
      return res.status(400).json({ error: "No OPDs has been created yet." });
    }
    // const opdS = opds.filter(opd => {
    //   return opd.isAvailable && opd.doctor.isAvailable;
    // });
    // if (opdS.length < 1) {
    //   return res
    //   .status(400)
    //   .json({ error: "OPD is not available at the moment" });
    // }
  res.json(opds);
};

exports.availability = async (req, res) => {
  const opd = await OPD.findById(req.query.opd_id).populate(
    "doctor",
    "_id name lastname email professionaltitle image specialities"
  );
  if (!opd) {
    return res.status(400).json({ error: "OPD not found" });
  }
  // if OPD expire
  if (new Date(opd.enddate).getTime() + opd.endtime * 3600000 < (Date.now() + 6 * 3600000)){
    if(opd.isAvailable){
    opd.isAvailable = false
    await opd.save()}
    return res.status(400).json({error:'OPD has expire!, cannot be toggled'})
  }

  if (opd.hospital.toString() !== req.hospital._id.toString()) {
    return res.status(401).json({ error: "Unauthorized " });
  } else {
    opd.isAvailable = !opd.isAvailable;
    await opd.save();
    res.json(opd.isAvailable);
  }
};
exports.getHos = async (req, res) => {
  const hospitals = await Hospital.find({}).select(
    "-password -salt -createdAt"
  );
  res.json(hospitals);
};

exports.getAppointments = async(req,res) => {
  const appointments = await Appointment.find({ hospital: req.hospital._id })
    .populate("user", "-salt -password -createdAt")
    .populate("doctor", " _id name lastname email professionaltitle specialities");
  if (!appointments) {
    return res.status(400).json({error: 'No appointments found'})
  }
  res.json(appointments)
}
exports.getAppointment = async(req,res) => {
  const appointments = await Appointment.findById(req.query.a_id)
    .populate("user", "-salt -password -createdAt")
    .populate("doctor", " _id name lastname email professionaltitle specialities");
  if (!appointments) {
    return res.status(400).json({error: 'No appointments found'})
  }
  res.json(appointments)
}

exports.flipStatus = async(req,res) => {
  let appointment = await Appointment.findById(req.query.a_id)
  if (!appointment) {
    return res.status(400).json({error: 'No appointment found'})
  }
  if (appointment.status === "inactive") appointment.status = "active";
  else if (appointment.status === "active") appointment.status = "complete";
  else if (appointment.status === "complete") appointment.status = "inactive";
  appointment = await appointment.save()
  res.json(appointment)
}
