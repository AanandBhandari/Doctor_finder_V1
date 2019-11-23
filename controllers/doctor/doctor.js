const Doctor = require("../../models/Doctor");
const sharp = require("sharp")
const path = require("path");
const fs = require("fs");
exports.profile = async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id).select("-password -salt")
    if (!doctor) {
        return res.status(400).json({ error: 'Doctor not found with this id' })
    }
    req.profile = doctor
    next();
}

// getProfile
exports.getProfile = async (req, res) => {
    res.json(req.profile)
}

// create profile
exports.createProfile = async (req, res) => {
    const { professionaltitle, specialities } = req.body
    let profile = await Doctor.findOne({_id:req.doctor._id, professionaltitle})
    if (profile) {
        return res.status(403).json({
            error: "Already added!"
        });
    }
    if (req.file !== undefined) {
      const { filename: image } = req.file;
      //Compress image
      await sharp(req.file.path)
      .resize(300)
      .jpeg({ quality: 100 })
      .toFile(path.resolve(req.file.destination, "resized", image));
      fs.unlinkSync(req.file.path);
      req.body.image = "doctor/resized/" + image;
    }
    profile = req.doctor
    profile.professionaltitle = professionaltitle
    profile.specialities = specialities
    profile.image = req.body.image
    profile = await profile.save()
    profile.salt = undefined
    profile.password = undefined
    res.json(profile)
}
// update profile
exports.updateProfile = async (req, res) => {
    const { professionaltitle, specialities } = req.body;
    if (req.file !== undefined) {
      const { filename: image } = req.file;
      //Compress image
      await sharp(req.file.path)
        .resize(300)
        .jpeg({ quality: 100 })
        .toFile(path.resolve(req.file.destination, "resized", image))
      fs.unlinkSync(req.file.path);
      req.body.image = "doctor/resized/" + image;
    }
    let profile = req.profile
    if(professionaltitle) profile.professionaltitle = professionaltitle;
    if(specialities) profile.specialities = specialities;
    if(req.body.image) profile.image = req.body.image
    profile = await profile.save();
    profile.salt = undefined;
    profile.password = undefined;
    res.json(profile);
}

// add workexp
exports.addWorkexp = async(req,res) => {
    let profile = req.profile
    profile.workexp.unshift(req.body)
    await profile.save()
    res.json(profile)
}
// remove workexp
exports.removeWorkExp = async(req,res) => {
    let profile = req.profile;
    // get remove index
    const removeIndex = profile.workexp.map(item=> item.id).indexOf(req.query.we_id);
    profile.workexp.splice(removeIndex,1);
    await profile.save()
    res.json(profile);
}


// add Education
exports.addEdu = async(req,res) => {
    let profile = req.profile
    profile.edu.unshift(req.body)
    await profile.save()
    res.json(profile)
}
// remove Education
exports.removeEdu = async(req,res) => {
    let profile = req.profile;
    // get remove index
    const removeIndex = profile.edu.map(item=> item.id).indexOf(req.query.edu_id);
    profile.edu.splice(removeIndex,1);
    await profile.save()
    res.json(profile);
}


// add training
exports.addTraining = async (req, res) => {
  let profile = req.profile;
  profile.training.unshift(req.body);
  await profile.save()
  res.json(profile);
};
// remove training
exports.removeTraining = async(req,res) => {
    let profile = req.profile;
    // get remove index
    const removeIndex = profile.training.map(item=> item.id).indexOf(req.query.train_id);
    profile.training.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
}


// add awards
exports.addAwards = async (req, res) => {
  let profile = req.profile;
  profile.awards.unshift(req.body);
  await profile.save()
  res.json(profile);
};
// remove awards
exports.removeAwards = async(req,res) => {
    let profile = req.profile;
    // get remove index
    const removeIndex = profile.awards.map(item=> item.id).indexOf(req.query.award_id);
    profile.awards.splice(removeIndex,1);
    await profile.save();
    res.json(profile);
}

// get Doctors
exports.getDoctors = async(req,res) => {
    const doctors = await Doctor.find({}).select(
      "_id name lastname email professionaltitle image specialities"
    );
    if(!doctors) {
        return res.status(400).json({error:" No doctors available"})
    }
    res.json(doctors)
}

exports.availability = async(req,res) => {
    req.profile.isAvailable = !req.profile.isAvailable;
    const a = req.profile
    await a.save()
    res.json(a.isAvailable)
}
