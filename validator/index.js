exports.signupValidator = (req, res, next) => {
 // name is not null and between 4-10 characters
 req.check("name", "Name is required").notEmpty();
 // email is not null, valid and normalized
 req.check("email", "Email must be between 3 to 32 characters")
     .matches(/.+\@.+\..+/)
     .withMessage("Invalid email")
     .isLength({
         min: 4,
         max: 2000
     });
 // check for password
 req.check("password", "Password is required").notEmpty();
 req.check("password")
     .isLength({ min: 6 })
     .withMessage("Password must contain at least 6 characters")
     .matches(/\d/)
     .withMessage("Password must contain a number");
 // check for errors
 const errors = req.validationErrors();
 // if error show the first one as they happen
 if (errors) {
     const firstError = errors.map(error => error.msg)[0];
     return res.status(422).json({ error: firstError });
 }
 // proceed to next middleware
 next();
};

exports.passwordResetValidator = (req, res, next) => {
 // check for password
 req.check("newPassword", "Password is required").notEmpty();
 req.check("newPassword")
     .isLength({ min: 6 })
     .withMessage("Password must be at least 6 chars long")
     .matches(/\d/)
     .withMessage("must contain a number")
     .withMessage("Password must contain a number");

 // check for errors
 const errors = req.validationErrors();
 // if error show the first one as they happen
 if (errors) {
     const firstError = errors.map(error => error.msg)[0];
     return res.status(400).json({ error: firstError });
 }
 // proceed to next middleware
 next();
};

exports.validateGeolocation = async (req, res, next) => {
    let error = []
    const { long, lat } = req.query
    if (long <= -180 || long >= 180) {
        error.push('Invalid longtitude')
    }
    if (lat <= -90 || lat >= 90) {
        error.push('Invalid latitude')
    }
    if (error.length > 0) {
        return res.status(422).json({ error:error[0] })
    }
    next();
}
exports.validateData = async(req,res,next) => {
    req.check("title", "Title is required")
      .notEmpty()
    req.check("address", "Address is required")
    .notEmpty()
    req.check("year", "Year is required")
    .notEmpty()
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(422).json({ error: firstError });
    }
    // proceed to next middleware
    next();
}

exports.validateOPD = async(req,res,next) => {
     req
       .check("startdate", "Startdate is not valid")
       .notEmpty()
       .isISO8601('yyyy-mm-dd')
       req.sanitize('startdate').toDate()
    req
        .check("enddate", "Enddate is not valid")
        .notEmpty()
        .isISO8601('yyyy-mm-dd')
       req.sanitize('enddate').toDate()
    req
        .check("starttime", "Start time is required")
        .notEmpty()
    req.check("endtime", "End time is required").notEmpty()
    req.check("timeslot", "Timeslot is not valid").notEmpty().isInt()
    req.check("consultfee", "Consult fee is not valid").notEmpty().isInt()
    const errors = req.validationErrors();
     // if error show the first one as they happen
     if (errors) {
       const firstError = errors.map(error => error.msg)[0];
       return res.status(422).json({ error: firstError });
     }
     // proceed to next middleware
     next();
}