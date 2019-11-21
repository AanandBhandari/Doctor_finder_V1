const Doctor = require("../../models/Doctor");
const { emailVerify } = require("../../helpers");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        let doctorExists = await Doctor.findOne({ email: req.body.email });
        if (doctorExists)
            return res.status(403).json({
                error: "Email is taken!"
            });
        let doctor = new Doctor(req.body);
        doctor.isRegistred = false;
        doctor = await doctor.save();
        const token = jwt.sign(
            { _id: doctor._id },
            process.env.JWT_EMAIL_VERIFICATION_KEY,
            { expiresIn: 60 * 3600 }
        );
        await emailVerify(req.body.email, req.body.name, token, 'doctor')
        res
            .status(200)
            .json({
                msg: `Follow the link provided to ${req.body.email} to completely register your account.`
            });
        setTimeout(async () => {
            const doctor = await Doctor.findOne({ email: req.body.email });
            !doctor.isRegistred && (await Doctor.deleteOne({ _id: doctor._id }));
            doctor.isRegistred &&
                (await Doctor.updateOne(
                    { _id: doctor._id },
                    { $unset: { isRegistred: "" } },
                    { multi: false }
                ));
        }, 1000 * 60);
    } catch (error) {
        res
            .status(500)
            .json({ error: error.message });
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
        await Doctor.updateOne(
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
    let doctor = await Doctor.findByCredentials(email, password)
    doctor.salt = undefined
    doctor.password = undefined
    if (!doctor) {
        return res.status(400).json({
            error: "Doctor with that email does not exist."
        });
    }

    const payload = {
        _id: doctor.id,
        name: doctor.name,
        email: doctor.email
    };
    const token = jwt.sign(
        payload,
        process.env.JWT_SIGNIN_KEY,
        { expiresIn: "1h" }
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
                const doctor = await Doctor.findById(user._id)
                doctor.salt = undefined
                doctor.password = undefined
                if (doctor) {
                    req.doctor = doctor
                    return next();
                }
                throw 'Invalid User'
            }
            throw user.error
        }
        throw 'Token not found'
    } catch (error) {
        res.status(401).json({ error: error })
    }
}
function parseToken(token) {
    // console.log('parseToken in doctor/auth',token.split(' ')[1]);
    try {
        return jwt.verify(token, process.env.JWT_SIGNIN_KEY);
    } catch (error) {
        return ({ error: error.message });
    }
}

// has authorization middleware
exports.hasAuthorization = async (req, res, next) => {
    try {
        const sameDocotor = req.profile && req.doctor && req.profile._id.toString() === req.doctor._id.toString()
        if (sameDocotor) {
            return next();
        }
        throw 'User is not authorized to perform this action'
    } catch (error) {
        res.status(403).json({ error: error })
    }
}