const User = require("../models/user");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const express = require('express');

exports.googleLogin = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ error: "Email not registered" });
    }

    // Check if Google login is allowed for the user
    if (!user.googleLogin) {
      return res.status(400).json({ error: "Google login not allowed for this user" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    // Respond with success and user data
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,  // Assuming you have these fields
        lastName: user.lastName,    // Assuming you have these fields
        role: user.role,            // Assuming you have these fields
        // Add any other user fields you want to include
      },
      message: "User logged in successfully"
    });
  } catch (error) {
    // Handle errors
    next(error);
  }
};


exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Received email:", email);
  console.log("Received password:", password);

  if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email & password' });
  }

  try {
      const user = await User.findOne({ email }).select('+password');
      console.log("User found:", user);

      if (!user) {
          return res.status(401).json({ message: 'Invalid Email or Password' });
      }

      const isPasswordMatched = await user.comparePassword(password);
      console.log("Password match result:", isPasswordMatched);

      if (!isPasswordMatched) {
          return res.status(401).json({ message: 'Invalid Email or Password' });
      }

      // Send the JWT token or any other response here
      sendToken(user, 200, res);

  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.registerUser = async (req, res, next) => {
  const { fname, lname, middlei, email, password, dateOfBirth, avatar, phone, address, memberId, googleLogin } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Use avatar from JSON if provided, or set to empty string
    let avatarUrl = avatar || '';

    // Determine the role based on whether memberId is provided (non-empty, non-null, non-undefined)
    const role = memberId ? 'member' : 'user';

    // Create a new user instance
    const newUser = new User({
      fname,
      lname,
      middlei,
      email,
      password,
      avatar: avatarUrl,
      dateOfBirth,
      phone,
      address,
      memberId: memberId || null, // If memberId is not provided, set it to null
      googleLogin: googleLogin || false, // Default to false if not provided
      role // Assign the role based on memberId
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token for the user
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      token,
      message: "User registered successfully"
    });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

exports.logout = async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out",
    });
};

exports.forgotPassword = async (req, res, next) => {
    console.log('Forgot password route hit'); 
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
      return res.status(404).json({ error: 'User not found with this email' })
      // return next(new ErrorHandler('User not found with this email', 404));
  }
  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // Create reset password url
  const resetUrl = `${req.protocol}://localhost:3000/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
  try {
      await sendEmail({
          email: user.email,
          subject: 'Reset Password',
          message
      })

      res.status(200).json({
          success: true,
          message: `Email sent to: ${user.email}`
      })

  } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ error: error.message })
      // return next(new ErrorHandler(error.message, 500))
  }
};

exports.resetPassword = async (req, res, next) => {
  console.log('Reset password route hit');
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Password reset token is invalid or has been expired' });
  }

  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
};
  
exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    });
};

exports.getUserProfile = async (req, res, next) => {
  try {
    
    // Retrieve user data based on user ID from request object
    const user = await User.findById(req.user.id);
  
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user exists, return user data
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
    console.log('Update Password route hit')
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
};

exports.updateProfile = async (req, res, next) => {
  try {
    console.log('Update User route hit');
    
    // Extract data from request body
    const { fname, lname, middlei, email, dateOfBirth, avatar, phone, address, memberId } = req.body;
    const userId = req.user.id;
  
    // Prepare new user data
    const newUserData = {
      fname,
      lname,
      middlei,
      email,
      dateOfBirth,
      avatar, // Update with the new avatar URL
      phone,  // Add phone number
      address, // Add address
      memberId // Add memberId
    };
  
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(userId, newUserData, {
      new: true,
      runValidators: true,
    });
  
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User Not Found or Not Updated' });
    }
  
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(id, { role }, { new: true });

      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, user });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
      const user = await User.findById(req.params.id);

      if (!user) {
          return res.status(404).json({ message: `User not found with id: ${req.params.id}` });
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ success: false, message: 'Server Error' });
  }
};