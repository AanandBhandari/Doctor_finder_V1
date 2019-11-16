const Hospital = require("../../models/Hospital");
exports.profile = async(req,res, next) => {
    const hospital =await Hospital.findById(req.params.id).select("name _id email address location phoneno website")
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
    let profile =await Hospital.findById(req.hospital._id)
    profile.address = address
    profile.website = website
    profile.phoneno = phoneno
    profile = await profile.save()
    if (profile) {
        profile.salt = undefined
        profile.password = undefined
        res.json(profile)
    }
}
// update profile
exports.updateProfile = async (req, res) => {
    const { address, website, phoneno, email, name } = req.body
    let profile = req.profile
    profile.address = address
    profile.website = website
    profile.phoneno = phoneno
    profile.email = email
    profile.name = name
    profile = await profile.save()
    if (profile) {
        profile.salt = undefined
        profile.password = undefined
        res.json(profile)
    }
}