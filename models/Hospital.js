const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point']
    },
    coordinates: {
        type: [Number]
    }
});
const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: pointSchema
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String
  },
  website: {
    type: String
  },
  phoneno: {
    type: Number,
    unique: true
  },
  isRegistred: {
    type: Boolean
  },
  doctors:[{
    type: Schema.Types.ObjectId,
    ref: 'doctor'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// index on location and let mongoDB know we are using a “2dsphere”.
hospitalSchema.index({ location: "2dsphere" });

const sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        passwordHash: value
    };
};
hospitalSchema.pre('save', function (next) {
    let hospital = this;
    if (hospital.isModified('password')) {
        // salt
        const ranStr = function (n) {
            return crypto.randomBytes(Math.ceil(8))
                .toString('hex')
                .slice(0, n);
        };
        // applying sha512 alogrithm
        let salt = ranStr(16);
        let passwordData = sha512(hospital.password, salt);
        hospital.password = passwordData.passwordHash;
        hospital.salt = salt;
        next();
    } else {
        next();
    }
})
hospitalSchema.statics.findByCredentials = async function (email, password) {
    let Hospital = this;
    const hospital = await Hospital.findOne({ email })
    if(!hospital) return ''
    let passwordData = sha512(password, hospital.salt)
    if (passwordData.passwordHash == hospital.password) {
        return hospital
    }
}

module.exports = mongoose.model("hospital", hospitalSchema);