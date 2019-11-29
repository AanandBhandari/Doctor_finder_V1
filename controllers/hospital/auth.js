const Hospital = require("../../models/Hospital");
const { emailVerify } = require("../../helpers");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    let hospitalExists = await Hospital.findOne({ email: req.body.email });
    if (hospitalExists)
      return res.status(403).json({
        error: "Email is taken!"
      });
    let hospital = new Hospital(req.body);
    // hospital.isRegistred = false;
    hospital = await hospital.save();
      const token = jwt.sign(
        { _id: hospital._id },
        process.env.JWT_EMAIL_VERIFICATION_KEY,
        { expiresIn: 60 * 3600 }
      );
      // await emailVerify(req.body.email,req.body.name,token,'hospital')
      res
        .status(200)
        .json({
          msg: `Follow the link provided to ${req.body.email} to completely register your account.`
        });
      // setTimeout(async () => {
      //   const hospital = await Hospital.findOne({ email: req.body.email });
      //   !hospital.isRegistred && (await Hospital.deleteOne({ _id: hospital._id }));
      //   hospital.isRegistred &&
      //     (await Hospital.updateOne(
      //       { _id: hospital._id },
      //       { $unset: { isRegistred: "" } },
      //       { multi: false }
      //     ));
      // }, 1000*60*5);
  } catch (error) {
    res
      .status(500)
      .json({error:error.message});
  }
};
// verify email link
exports.emailverify = async (req, res) => {
  try {
    const token = req.query.id;
    const decoded = await jwt.verify(
      token,
      process.env.JWT_EMAIL_VERIFICATION_KEY
    );
    await Hospital.updateOne(
      { _id: decoded._id },
      { $set: { isRegistred: true } },
      { multi: false }
    );
    res.status(200).json({ msg: "Successfully signup!" });
  } catch (error) {
    res.send(400).json({ error: "Invalid Link!, Please sign up again after 10 minutes" });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  let hospital = await Hospital.findByCredentials(email, password)
  hospital.salt = undefined
  hospital.password = undefined
  if (!hospital) {
    return res.status(400).json({
      error: "Hospital with that email does not exist."
    });
  }

  const payload = {
    _id: hospital.id,
    name: hospital.name,
    email: hospital.email
  };
  const token = jwt.sign(
    payload,
    process.env.JWT_SIGNIN_KEY,
    {expiresIn:"1h"}
  );

  return res.json({ token });
};

// authentication middleware
exports.auth = async (req, res, next) => {
  const token = req.header('x-auth-token');
  try {

    if (token) {
      const user = await parseToken(token)
      if (user._id) {
        const hospital = await Hospital.findById(user._id).select('-password -salt')
        if (hospital) {
          req.hospital = hospital
          return next();
        }
        throw 'Invalid User'
      }
      throw user.error
    }
    throw 'Token not found'
  } catch (error) {
    res.status(401).json({error:error})
  }
}
function parseToken(token) {
  // console.log('parseToken in hospital/auth',token.split(' ')[1]);
  try {
    return jwt.verify(token, process.env.JWT_SIGNIN_KEY);
  } catch (error) {
    return ({ error: error.message });
  }
}

// has authorization middleware
exports.hasAuthorization = async (req, res, next) => {
  try {
    const sameHospital = req.profile && req.hospital && req.profile._id.toString() === req.hospital._id.toString()
    if (sameHospital) {
      return next();
    }
    throw 'User is not authorized to perform this action'
  } catch (error) {
    res.status(403).json({ error: error })
  }
}