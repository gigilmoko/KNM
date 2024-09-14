const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

require('dotenv').config({ path: './config/config.env' });

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  middlei: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,  // Set to false since it's optional
  },
  role: {
    type: String,
    enum: ["admin", "user", "member"],
    // default: "user",
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    required: true,  // Set to true if phone number is mandatory
  },
  address: {
    type: String,
    required: true,  // Set to true if address is mandatory
  },
  memberId: {
    type: String,
    // required: true,  // Set to true if memberId is mandatory
  },
  googleLogin: {
    type: Boolean,
    default: false, // Default to false if not set
  },
  applyMember: {
    type: Boolean,
    default: false, // Default to false if not set
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });




userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};


module.exports = mongoose.model("User", userSchema);