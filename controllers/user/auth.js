const User = require("../../models/User");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    let userExists = await User.findOne({ email: req.body.email });
    console.log(userExists);
    if (userExists)
      return res.status(403).json({
        error: "Email is taken!"
      });
      req.body.isRegistred = true;
    let user = new User(req.body);
    await user.save();
    res.json({msg:"Successfully signed up"})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findByCredentials(email, password);
  user.salt = undefined;
  user.password = undefined;
  if (!user) {
    return res.status(400).json({
      error: "User with that email does not exist."
    });
  }

  const payload = {
    _id: user.id,
    name: user.name,
    email: user.email
  };
  const token = jwt.sign(payload, process.env.JWT_SIGNIN_KEY, {
    expiresIn: "10h"
  });

  return res.json({ token });
};

// authentication middleware
exports.auth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  try {
    if (token) {
      let user = await parseToken(token);
      if (user._id) {
        user = await User.findById(user._id).select('-password -salt')
        if (user) {
          req.user = user;
          return next();
        }
        throw "Invalid User";
      }
      throw user.error;
    }
    throw "Token not found";
  } catch (error) {
    res.status(401).json({ error: error });
  }
};
function parseToken(token) {
  // console.log('parseToken in user/auth',token.split(' ')[1]);
  try {
    return jwt.verify(token, process.env.JWT_SIGNIN_KEY);
  } catch (error) {
    return { error: error.message };
  }
}

// has authorization middleware
exports.hasAuthorization = async (req, res, next) => {
  try {
    const sameUser =
      req.profile &&
      req.user &&
      req.profile._id.toString() === req.user._id.toString();
    if (sameUser) {
      return next();
    }
    throw "User is not authorized to perform this action";
  } catch (error) {
    res.status(403).json({ error: error });
  }
};
