const mongoose = require("mongoose");
const crypto = require("crypto");
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point']
    },
    coordinates: {
        type: [Number]
    }
});
const userSchema = new mongoose.Schema({
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
    address: {
        type: String
    },
    location: {
        type: pointSchema,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    dob:{
        type: Date
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    phoneno: {
        type: Number,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    isRegistred: {
        type: Boolean,
        default : false
    }
})

userSchema.index({ location: "2dsphere" });

const sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        passwordHash: value
    };
};
userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        // salt
        const ranStr = function (n) {
            return crypto.randomBytes(Math.ceil(8))
                .toString('hex')
                .slice(0, n);
        };
        // applying sha512 alogrithm
        let salt = ranStr(16);
        let passwordData = sha512(user.password, salt);
        user.password = passwordData.passwordHash;
        user.salt = salt;
        next();
    } else {
        next();
    }
})
userSchema.statics.findByCredentials = async function (email, password) {
    let User = this;
    const user = await User.findOne({ email })
    if (!user) return ''
    let passwordData = sha512(password, user.salt)
    if (passwordData.passwordHash == user.password) {
        return user
    }
}

module.exports = mongoose.model("user", userSchema);