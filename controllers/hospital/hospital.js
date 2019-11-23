const Hospital = require("../../models/Hospital");
const OPD = require("../../models/OPD");
const Doctor = require("../../models/Doctor")
exports.profile = async(req,res, next) => {
    const hospital = await Hospital.findById(req.params.id).select(
      "-password -salt"
    );
    if (!hospital) {
        return res.status(400).json({error:'Hospital not found with this id'})
    }
    req.profile = hospital
    next();
}

// getProfile
exports.getProfile = async(req,res) => {
    res.json(req.profile)
}

// create profile
exports.createProfile = async(req,res) => {
    const {address,website,phoneno} = req.body
    let profile =await Hospital.findOne({_id:req.hospital._id, address})
    if (profile) {
        return res.status(403).json({
          error: "Profile is already added!"
        });
    }
    profile = req.hospital
    profile.address = address
    profile.website = website
    profile.phoneno = phoneno
    profile = await profile.save()
    profile.salt = undefined
    profile.password = undefined
    res.json(profile)
}
// update profile
exports.updateProfile = async (req, res) => {
    const { address, website, phoneno, email, name } = req.body
    let profile = req.profile
    address && (profile.address = address)
    website && (profile.website = website)
    phoneno && (profile.phoneno = phoneno)
    email && (profile.email = email)
    name && (profile.name = name)
    await profile.save()
    res.json(profile)
}

// add location
exports.addLocation = async (req, res) => {
        const { long, lat } = req.query
        location = {
            type: "Point",
            coordinates: [long, lat]
        }
        req.profile.location = location
        const result = await req.profile.save()
        res.json(result.location);
}

// set OPD
exports.setOPD = async(req,res) => {
    const doctor = await Doctor.findById(req.query.d_id)
    if (!doctor) {
        return res.status(400).json({error: 'Doctor not found'})
    }
    if (!doctor.isAvailable) {
        return res.status(400).json({ error: "Doctor is not Available" });
    }
    let newOPD = req.body
    newOPD.doctor = doctor._id
    newOPD.hospital = req.hospital._id
    newOPD = new OPD(newOPD)
    newOPD = await newOPD.save()
    res.json(newOPD)
}

// delete OPD
exports.deleteOPD = async(req,res) => {
    const opd = await OPD.findById(req.query.opd_id);
    if (!opd) {
        return res.status(404).json({ error: "OPD not found" });
    }
    if (opd.hospital.toString() !== req.hospital._id.toString()) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    await opd.remove();
    res.json({ msg: "OPD removed" });
}

exports.getOPD = async(req,res) => {
    const opd = await OPD.findById(req.query.opd_id).populate(
      "doctor",
      "_id name lastname email professionaltitle image specialities"
    );
    if (!opd) {
      return res.status(404).json({ error: "OPD not found" });
    }
    if (opd.hospital.toString() !== req.hospital._id.toString()) {
      return res.status(401).json({ error: "Unauthorized " });
    } else {
        res.json(opd)
    }
}

exports.getOPDs = async (req, res) => {
  const opd = await OPD.find({ hospital: req.hospital._id }).populate(
    "doctor",
    "_id name lastname email professionaltitle image specialities"
  );
  if (!opd) {
    return res.status(404).json({ error: "No OPDs" });
  }
    res.json(opd);
};

exports.availability = async (req, res) => {
   const opd = await OPD.findById(req.query.opd_id).populate(
      "doctor",
      "_id name lastname email professionaltitle image specialities"
    );
    if (!opd) {
      return res.status(404).json({ error: "OPD not found" });
    }
    if (opd.hospital.toString() !== req.hospital._id.toString()) {
      return res.status(401).json({ error: "Unauthorized " });
    } else {
        opd.isAvailable = !opd.isAvailable
        await opd.save()
        res.json(opd.isAvailable)
    }
};