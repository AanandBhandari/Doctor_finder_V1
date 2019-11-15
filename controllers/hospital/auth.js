const Hospital = require("../../models/Hospital");
const { verifyEmail } = require("../../helpers/emailverify");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    let hospitalExists = await Hospital.findOne({ email: req.body.email });
    if (hospitalExists)
      return res.status(403).json({
        error: "Email is taken!"
      });
    let hospital = new Hospital(req.body);
    hospital.isRegistred = false;
    hospital = await hospital.save();
      const token = jwt.sign(
        { _id: hospital._id },
        process.env.JWT_EMAIL_VERIFICATION_KEY,
        { expiresIn: 60 * 3600 }
      );
      await verifyEmail(req.body.email,req.body.name,token)
      res
        .status(200)
        .json({
          msg: `Follow the link provided to ${req.body.email} to verify it.`
        });
      setTimeout(async () => {
        // console.log(req.body.email);
        const hospital = await Hospital.findOne({ email: req.body.email });
        !hospital.isRegistred && (await Hospital.deleteOne({ _id: hospital._id }));
        hospital.isRegistred &&
          (await Hospital.updateOne(
            { _id: hospital._id },
            { $unset: { isRegistred: "" } },
            { multi: false }
          ));
      }, 1000*60);
  } catch (error) {
    res
      .status(500)
      .json({error:error.message});
  }
};
// verifying email link
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
    res.send(400).json({ error: "Invalid Link" });
  }
};
