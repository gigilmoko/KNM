const User = require("../models/user");
const Member = require("../models/member");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const express = require('express');
const axios = require('axios');
const { createTransporter } = require('../config/mail');
const ejs = require('ejs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dglawxazg',
  api_key: '655852923368639',
  api_secret: '5hqre3DUxZG5YlOXD5HoSnj4HgQ'
});

exports.deleteImage = async (req, res) => {
  const { public_id } = req.params;

  try {
      const result = await cloudinary.uploader.destroy(public_id);
      console.log('Image deleted:', result); // Log deletion success
      res.json({ success: true, result });
  } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
};

exports.avatarUpdate = async (req, res) => {
  console.log('avatarUpdate endpoint hit'); // Log when the endpoint is accessed

  // Log the entire request body
  console.log('Request Body:', req.body); // Log the entire body of the request

  const { avatar } = req.body; // Get the avatar URL from the request body
  const userId = req.params.id; // Get the user ID from the request parameters

  console.log('User ID from request:', userId); // Log the user ID being received
  console.log('Avatar URL from request:', avatar); // Log the avatar URL being received

  if (!avatar) {
      return res.status(400).json({ message: "No avatar URL provided" });
  }

  try {
      // Fetch user by ID
      const user = await User.findById(userId);
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' }); // Handle case where user does not exist
      }

      // Update user avatar URL in database
      user.avatar = avatar; // Set the new avatar URL
      await user.save();

      console.log('Avatar updated successfully:', user.avatar); // Log the new avatar URL

      res.status(200).json({
          success: true,
          avatar: user.avatar,
      });
  } catch (error) {
      console.error('Error updating avatar:', error);
      res.status(500).json({ message: "Server Error" });
  }
};

// Exported function to fetch user and member data where conditions match
// Exported function to fetch user and member data where conditions match
exports.fetchUserMemberMatch = async (req, res) => {
  try {
      const { memberId } = req.query; // Get memberId from request query

      // Use aggregation to find users applying for membership
      const applyingUsers = await User.aggregate([
          {
              $match: {
                  applyMember: true, // Users who are applying for membership
                  role: 'user' // Still have user role (not yet approved as member)
              }
          },
          {
              $project: {
                  fname: 1,
                  lname: 1,
                  middlei: 1,
                  email: 1,
                  memberId: 1,
                  role: 1,
                  applyMember: 1,
                  avatar: 1,
                  createdAt: 1
              }
          },
          {
              $sort: { createdAt: -1 } // Sort by creation date, newest first
          }
      ]);

      if (applyingUsers.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No users applying for membership found'
          });
      }

      // Return the users applying for membership
      return res.json({
          success: true,
          data: applyingUsers,
          count: applyingUsers.length
      });

  } catch (error) {
      console.error('Error fetching users applying for membership:', error);
      return res.status(500).json({
          success: false,
          message: 'Server error while fetching users applying for membership'
      });
  }
};

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
  const { email, password, deviceToken } = req.body;
  console.log("Received email:", email);
  console.log("Received password:", password);
  console.log("Received deviceToken:", deviceToken);

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email & password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    // Check if user is admin
    // console.log("User role:", user.role);
    // if (user.role.includes('admin')) {
    //   console.log("Admin detected, sending verification code...");
      
    //   // Generate and send verification code
    //   const code = Math.floor(100000 + Math.random() * 900000).toString();
    //   console.log("Generated code:", code);
    //   user.verificationCode = code;
    //   user.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    //   await user.save();
    //   console.log("Verification code saved to user");

    //   // Send verification code via email
    //   try {
    //     console.log("Creating transporter...");
    //     const transporter = createTransporter();
        
    //     console.log("Rendering email template...");
    //     const emailTemplate = await ejs.renderFile(
    //       path.join(__dirname, '../views/verificationemail.ejs'),
    //       {
    //         user: user,
    //         verificationCode: code
    //       }
    //     );
        
    //     console.log("Sending email to:", user.email);
    //     await transporter.sendMail({
    //       from: process.env.GMAIL_USER || 'noreply@yourapp.com',
    //       to: user.email,
    //       subject: 'Admin Login Verification Code',
    //       html: emailTemplate
    //     });

    //     console.log("Email sent successfully!");
    //     return res.status(200).json({
    //       success: true,
    //       requiresVerification: true,
    //       message: 'Verification code sent to your email'
    //     });
    //   } catch (emailError) {
    //     console.error('Email sending failed:', emailError);
    //     return res.status(500).json({ message: 'Failed to send verification code' });
    //   }
    // } else {
    //   console.log("User is not admin, proceeding with normal login...");
    // }

    // Update OneSignal player tags and device token for non-admin users
    if (deviceToken) {
      try {
        await axios.put(
          `https://onesignal.com/api/v1/players/${deviceToken}`,
          {
            app_id: process.env.ONESIGNAL_APP_ID,
            tags: {
              role: user.role[0],
              userId: user._id.toString()
            }
          },
          {
            headers: {
              'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        user.deviceToken = deviceToken;
        await user.save();
        console.log('Updated player tags and device token:', { deviceToken, role: user.role[0] });
      } catch (oneSignalError) {
        console.error('OneSignal update error:', oneSignalError);
      }
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this new function to your authController.js
exports.verifyAdminCode = async (req, res, next) => {
  const { email, verificationCode } = req.body;
  console.log("Admin verification attempt - Email:", email);
  console.log("Admin verification attempt - Code:", verificationCode);

  if (!email || !verificationCode) {
    return res.status(400).json({ error: 'Please provide email and verification code' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (!user.role.includes('admin')) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Verify the code
    if (user.verificationCode !== verificationCode || user.verificationCodeExpire < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }

    // Clear verification code after successful verification
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    console.log("Admin verification successful for:", email);

    // Send token for successful login
    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error during admin verification:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this new function after the verifyAdminCode function
exports.resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  console.log("Resend verification attempt - Email:", email);

  if (!email) {
    return res.status(400).json({ error: 'Please provide email' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (!user.role.includes('admin')) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Generate new verification code
    const code = Math.floor(100000 + Math.random() * 900000); // Generate as number
    console.log("Generated new code:", code);
    
    user.verificationCode = code.toString(); // Store as string for consistency
    user.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log("New verification code saved to user");

    // Send verification code via email
    try {
      console.log("Creating transporter for resend...");
      const transporter = createTransporter();
      
      console.log("Rendering email template for resend...");
      const emailTemplate = await ejs.renderFile(
        path.join(__dirname, '../views/verificationemail.ejs'),
        {
          user: user,
          verificationCode: code
        }
      );
      
      console.log("Sending resend email to:", user.email);
      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'noreply@yourapp.com',
        to: user.email,
        subject: 'Admin Login Verification Code - Resent',
        html: emailTemplate
      });

      console.log("Resend email sent successfully!");
      return res.status(200).json({
        success: true,
        message: 'New verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Resend email failed:', emailError);
      return res.status(500).json({ message: 'Failed to resend verification code' });
    }
  } catch (error) {
    console.error("Error during resend verification:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ...existing code...



exports.registerUserMember = async (req, res, next) => {
  const { fname, lname, middlei, email, password, dateOfBirth, avatar, phone, memberId, googleLogin, imageMember } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Use avatar and imageMember from JSON if provided, or set them to empty strings
    let avatarUrl = avatar || '';
   

    // Set the role and applyMember to default values
    const role = 'user'; // role is 'user' by default
    const applyMember = true; // applyMember defaults to true

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
      memberId: memberId || null, // If memberId is not provided, set it to null
      googleLogin: googleLogin || false, // Default to false if not provided
      role, // Assign the role as 'user'
      applyMember // Set applyMember to true
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

// register user
exports.registerUser = async (req, res, next) => {
  const { fname, lname, middlei, email, password, dateOfBirth, avatar, phone, address, googleLogin } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Use avatar from JSON if provided, or set to empty string
    let avatarUrl = avatar || '';

    // Set memberId to null and role to 'user' by default
    const memberId = null;
    const imageMember = null;
    const role = 'user';

    // Generate email verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated verification code:", verificationCode);

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
      memberId,
      googleLogin: googleLogin || false,
      role,
      imageMember,
      emailVerificationCode: verificationCode.toString(),
      emailVerificationCodeExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
      isEmailVerified: false
    });

    // Save the new user to the database
    await newUser.save();

    // Send verification email
    try {
      console.log("Creating transporter for email verification...");
      const transporter = createTransporter();
      
      console.log("Rendering email verification template...");
      const emailTemplate = await ejs.renderFile(
        path.join(__dirname, '../views/emailverification.ejs'),
        {
          user: newUser,
          verificationCode: verificationCode
        }
      );
      
      console.log("Sending verification email to:", newUser.email);
      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'noreply@yourapp.com',
        to: newUser.email,
        subject: 'Email Verification Code',
        html: emailTemplate
      });

      console.log("Verification email sent successfully!");
      
      // Respond with success but require verification
      res.status(201).json({
        success: true,
        requiresVerification: true,
        userId: newUser._id,
        message: "Registration successful! Please check your email for verification code."
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete the user if email sending fails
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    // Handle errors
    next(error);
  }
};

// verify
exports.verifyEmailCode = async (req, res, next) => {
  const { userId, verificationCode } = req.body;
  console.log("Email verification attempt - UserId:", userId);
  console.log("Email verification attempt - Code:", verificationCode);

  if (!userId || !verificationCode) {
    return res.status(400).json({ error: 'Please provide user ID and verification code' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Verify the code
    if (user.emailVerificationCode !== verificationCode || user.emailVerificationCodeExpire < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired verification code' });
    }

    // Clear verification code and mark email as verified
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpire = undefined;
    user.isEmailVerified = true;
    await user.save();

    console.log("Email verification successful for:", user.email);

    // Generate a JWT token for the verified user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    // Send token for successful verification
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        role: user.role,
      },
      message: "Email verified successfully! You are now logged in."
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend email verification code
exports.resendEmailVerificationCode = async (req, res, next) => {
  const { userId } = req.body;
  console.log("Resend email verification attempt - UserId:", userId);

  if (!userId) {
    return res.status(400).json({ error: 'Please provide user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification code
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated new verification code:", code);
    
    user.emailVerificationCode = code.toString();
    user.emailVerificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log("New email verification code saved to user");

    // Send verification code via email
    try {
      console.log("Creating transporter for resend email verification...");
      const transporter = createTransporter();
      
      console.log("Rendering email verification template for resend...");
      const emailTemplate = await ejs.renderFile(
        path.join(__dirname, '../views/emailverification.ejs'),
        {
          user: user,
          verificationCode: code
        }
      );
      
      console.log("Sending resend verification email to:", user.email);
      await transporter.sendMail({
        from: process.env.GMAIL_USER || 'noreply@yourapp.com',
        to: user.email,
        subject: 'Email Verification Code - Resent',
        html: emailTemplate
      });

      console.log("Resend verification email sent successfully!");
      return res.status(200).json({
        success: true,
        message: 'New verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Resend verification email failed:', emailError);
      return res.status(500).json({ message: 'Failed to resend verification code' });
    }
  } catch (error) {
    console.error("Error during resend email verification:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check email verification status
exports.checkEmailVerificationStatus = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      isEmailVerified: user.isEmailVerified,
      email: user.email
    });
  } catch (error) {
    console.error("Error checking email verification status:", error);
    res.status(500).json({ message: 'Server error' });
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
  // const resetUrl = `knm-gltn.onrender.com/password/reset/${resetToken}`;
  const resetUrl = `http://localhost:3000/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password',
      message,
    });
  
    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    console.error('Email sending failed:', error); // Log the error for debugging
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
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

exports.allUsersApply = async (req, res, next) => {
  try {
      const users = await User.find({ 'applyMember': true });
      res.status(200).json({
          success: true,
          users,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Failed to fetch users",
          error: error.message,
      });
  }
};

exports.countUsersApply = async (req, res, next) => {
  try {
      const count = await User.countDocuments({ applyMember: true });
      res.status(200).json({
          success: true,
          count,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Failed to count users who applied",
          error: error.message,
      });
  }
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

exports.getUserProfileById = async (req, res, next) => {
  try {
    const { id } = req.params; // Get user ID from the URL params
    const user = await User.findById(id); // Find user by ID

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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

    user.password = req.body.newPassword; 
    await user.save();

    sendToken(user, 200, res);
};

exports.updatePasswordMobile = async (req, res, next) => {
  console.log('Update Password route hit');

  // Assuming you pass the user ID in the request body
  const { userId, oldPassword, newPassword } = req.body;

  const user = await User.findById(userId).select("password");
  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }

  // Check previous user password
  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
  }

  user.password = newPassword; // Set new password
  await user.save();

  sendToken(user, 200, res); // Send token after updating password
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

exports.updateProfileMobile = async (req, res) => {
  try {
      console.log('Update User Mobile route hit');
      console.log('Request Body:', req.body);

      // Extract data from request body
      const { userId, fname, lname, middlei, email, dateOfBirth, phone, address } = req.body;

      // Check if userId is provided
      if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      // Prepare new user data
      const newUserData = {
          fname,
          lname,
          middlei,
          email,
          dateOfBirth,
          phone,
          address,
      };

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(userId, newUserData, {
          new: true,
          runValidators: true,
      });

      // Check if user was found and updated
      if (!updatedUser) {
          console.error('User Not Found or Not Updated');
          return res.status(404).json({ success: false, message: 'User Not Found or Not Updated' });
      }

      res.status(200).json({
          success: true,
          user: updatedUser,
      });
  } catch (error) {
      console.error('Error:', error);
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

exports.approveApplyMember = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from params

    // Find the user and update the role to 'member' and applyMember to false
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role: 'member', applyMember: false } },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User approved and role updated to member',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error approving apply member:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while approving member'
    });
  }
};

exports.denyApplyMember = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from params

    // Find the user and update applyMember to false
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { applyMember: false } },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User application denied',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error denying apply member:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while denying member'
    });
  }
};

exports.applyingForMember = async (req, res, next) => {
  try {
    const { id } = req.params; // Get user ID from route params
    const { memberId } = req.body; // Get memberId from request body

    // Find user by ID and update applyMember to true and set memberId
    const user = await User.findByIdAndUpdate(
      id,
      { applyMember: true, memberId },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Respond with success and updated user data
    res.status(200).json({ success: true, user });
  } catch (error) {
    // Handle potential errors
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

exports.getUsersByMonth = async (req, res) => {
  try {
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({ success: true, data: usersByMonth });
  } catch (error) {
    console.error("Error fetching users by month:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getUsersByCurrentMonth = async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const usersCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    res.status(200).json({ success: true, count: usersCount });
  } catch (error) {
    console.error("Error fetching users by current month:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllUsersCount = async (req, res) => {
  try {
    // Count all users in the database
    const totalUsersCount = await User.countDocuments();

    res.status(200).json({ success: true, count: totalUsersCount });
  } catch (error) {
    console.error("Error fetching total user count:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getUsersCountForPast7Days = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate user creation counts for the past 7 days
    const usersCountByDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }, // Filter users created in the past 7 days
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week (1=Sunday, 7=Saturday)
          count: { $sum: 1 }, // Count the number of users
        },
      },
      {
        $project: {
          day: {
            $arrayElemAt: [
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
              { $subtract: ["$_id", 1] },
            ],
          },
          count: 1,
        },
      },
      {
        $sort: { _id: 1 }, // Ensure days are in chronological order
      },
    ]);

    // Map results to ensure all days have a count (default to 0 if no users created)
    const result = Array(7)
      .fill(0)
      .map((_, i) => ({
        day: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][(new Date().getDay() + i - 6 + 7) % 7], // Calculate day names for the past week
        count:
          usersCountByDay.find((d) => d.day ===
          [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][(new Date().getDay() + i - 6 + 7) % 7])?.count || 0,
      }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching user count for past 7 days:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getUsersCountForToday = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Aggregate users created today by 4-hour intervals
    const usersCountByInterval = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: {
            $hour: "$createdAt", // Group by the hour field
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1, // Sort by hour
        },
      },
    ]);

    // Format results into 4-hour intervals
    const intervals = [
      { start: 0, end: 4, label: "12:00 AM - 4:00 AM" },
      { start: 4, end: 8, label: "4:00 AM - 8:00 AM" },
      { start: 8, end: 12, label: "8:00 AM - 12:00 PM" },
      { start: 12, end: 16, label: "12:00 PM - 4:00 PM" },
      { start: 16, end: 20, label: "4:00 PM - 8:00 PM" },
      { start: 20, end: 24, label: "8:00 PM - 12:00 AM" },
    ];

    const result = intervals.map(interval => {
      const count = usersCountByInterval
        .filter(item => item._id >= interval.start && item._id < interval.end)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        interval: interval.label,
        count,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching user count for today:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTotalMembers = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: "member" });

    res.status(200).json({
      success: true,
      totalMembers,
    });
  } catch (error) {
    console.error("Error fetching total members:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateAddressAndDetails = async (req, res, next) => {
  try {
    console.log('Update Address and Details route hit');
    console.log('Request Body:', req.body);

    // Extract userId and addressData from request
    const { userId, addressData, addressIndex } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Initialize deliveryAddress array if it doesn't exist
    if (!user.deliveryAddress) {
      user.deliveryAddress = [];
    }

    // Handle address update if addressData is provided
    if (addressData) {
      // Validate that we have all required address fields
      if (!addressData.houseNo || !addressData.streetName || !addressData.barangay || !addressData.city) {
        return res.status(400).json({
          success: false,
          message: 'All address fields are required',
        });
      }

      // Create the address object with all required fields
      const updatedAddress = {
        houseNo: addressData.houseNo,
        streetName: addressData.streetName,
        barangay: addressData.barangay,
        city: addressData.city,
        latitude: addressData.latitude || 0,
        longitude: addressData.longitude || 0,
      };

      // Check if we're updating an existing address or adding a new one
      if (addressIndex !== undefined && addressIndex >= 0 && addressIndex < user.deliveryAddress.length) {
        // Update existing address at the specified index
        user.deliveryAddress[addressIndex] = updatedAddress;
        console.log(`Updated address at index ${addressIndex}`);
      } else {
        // Add as a new address if no index is specified or index is invalid
        user.deliveryAddress.push(updatedAddress);
        console.log('Added new address');
      }
    }

    // Update other user details if provided
    if (req.body.fname) user.fname = req.body.fname;
    if (req.body.lname) user.lname = req.body.lname;
    if (req.body.email) user.email = req.body.email;
    if (req.body.contactNo) user.contactNo = req.body.contactNo;

    // Save the updated user
    const updatedUser = await user.save();

    console.log('User details updated successfully');
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add this function to create a new address
exports.createAddress = async (req, res, next) => {
  try {
    console.log('Create Address route hit');
    console.log('Request Body:', req.body);

    const { userId, address } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!address || !address.houseNo || !address.streetName || !address.barangay || !address.city) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create new address object with all required fields
    const newAddress = {
      houseNo: address.houseNo,
      streetName: address.streetName,
      barangay: address.barangay,
      city: address.city,
      latitude: address.latitude || 0,
      longitude: address.longitude || 0,
    };

    // Add the new address to the user's deliveryAddress array
    // Initialize the array if it doesn't exist
    if (!user.deliveryAddress) {
      user.deliveryAddress = [];
    }
    
    user.deliveryAddress.push(newAddress);
    
    // Save the updated user
    const updatedUser = await user.save();

    console.log('Address successfully created');
    res.status(201).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add this function to delete an address
exports.deleteAddress = async (req, res, next) => {
  try {
    console.log('Delete Address route hit');
    
    const { userId, addressIndex } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (addressIndex === undefined || addressIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid address index is required',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if the address at the specified index exists
    if (!user.deliveryAddress || !user.deliveryAddress[addressIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Address not found at the specified index',
      });
    }

    // Remove the address at the specified index
    user.deliveryAddress.splice(addressIndex, 1);
    
    // Save the updated user
    const updatedUser = await user.save();

    console.log('Address successfully deleted');
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};









