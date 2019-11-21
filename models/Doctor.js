const mongoose = require("mongoose");
const crypto = require('crypto')
const Schema = mongoose.Schema
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  lastname: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  professionaltitle: {
    type: String
  },
  specialities: [
    {
      type: String,
      required: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  workexp: [
    {
      title: {
        type: String,
        required: true
      },
      organization: {
        type: String,
        required: true
      },
      address: {
        type: String
      },
      year: {
        type: Number
      }
    }
  ],
  edu: [
    {
      title: {
        type: String,
        required: true
      },
      institutename: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      passoutyear: {
        type: String,
        required: true
      }
    }
  ],
  training: [
    {
      title: {
        type: String,
        required: true
      },
      organization: {
        type: String,
        required: true
      },
      address: {
        type: String
      },
      year: {
        type: Number
      }
    }
  ],
  awards: [
    {
      title: {
        type: String,
        required: true
      },
      address: {
        type: String
      },
      year: {
        type: Number
      }
    }
  ],
  image: {
    type: String
  },
  isRegistred: {
    type: Boolean
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String
  }
});

const sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        passwordHash: value
    };
};
doctorSchema.pre('save', function (next) {
    let doctor = this;
    if (doctor.isModified('password')) {
        // salt
        const ranStr = function () {
            return crypto.randomBytes(Math.ceil(8))
                .toString('hex')
                .slice(0, 16);
        };
        // applying sha512 alogrithm
        let salt = ranStr(16);
        let passwordData = sha512(doctor.password, salt);
        doctor.password = passwordData.passwordHash;
        doctor.salt = salt;
        next();
    } else {
        next();
    }
})
doctorSchema.statics.findByCredentials = async function (email, password) {
    let Doctor = this;
    const doctor = await Doctor.findOne({ email })
    if (!doctor) return ''
    let passwordData = sha512(password, doctor.salt)
    if (passwordData.passwordHash == doctor.password) {
        return doctor
    }
}

module.exports = mongoose.model("doctor", doctorSchema);