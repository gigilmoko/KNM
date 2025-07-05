const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

require("dotenv").config({ path: "./config/config.env" });

const userSchema = new mongoose.Schema(
  {
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
    deviceToken: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user", "member"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    deliveryAddress: [
      {
        houseNo: {
          type: String,
          default: "none",
        },
        streetName: {
          type: String,
          default: "none",
        },
        barangay: {
          type: String,
          default: "none",
        },
        city: {
          type: String,
          default: "none",
        },
        latitude: {
          type: Number,
          default: 0,
        },
        longitude: {
          type: Number,
          default: 0,
        },
      },
    ],
    memberId: {
      type: String,
    },
    googleLogin: {
      type: Boolean,
      default: false,
    },
    applyMember: {
      type: Boolean,
      default: false,
    },
    imageMember: {
      type: String,
      required: false,
    },
    emailVerificationCode: {
      type: String,
    },
    emailVerificationCodeExpire: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpire: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetCodeExpire: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

module.exports = mongoose.model("User", userSchema);
