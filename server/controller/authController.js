const User = require("../models/user");
const Member = require("../models/member");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const jwt = require('jsonwebtoken');
const express = require('express');


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
exports.fetchUserMemberMatch = async (req, res) => {
  try {
      const { fname, lname, memberId, role } = req.query; // Get parameters from request

      // Fetch all users and members first
      let users = await User.find(); // Fetch all users
      let members = await Member.find(); // Fetch all members

      // Filter users where role is 'user'
      const filteredUsers = users.filter(user => user.role === 'user');

      // Compare filtered users to members based on matching fname, lname, and memberId
      const matchingUsers = filteredUsers.filter(user => 
          members.some(member => 
              member.fname === user.fname && 
              member.lname === user.lname && 
              member.memberId === user.memberId
          )
      );

      if (matchingUsers.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No matching user-member found'
          });
      }

      // If found, return the user and member data
      return res.json({
          success: true,
          data: matchingUsers
      });

  } catch (error) {
      console.error('Error fetching user-member match:', error);
      return res.status(500).json({
          success: false,
          message: 'Server error while fetching user-member match'
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

//old
exports.registerUserMember = async (req, res, next) => {
  const { fname, lname, middlei, email, password, dateOfBirth, avatar, phone, address, memberId, googleLogin, imageMember } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Use avatar and imageMember from JSON if provided, or set them to empty strings
    let avatarUrl = avatar || '';
    let imageMemberUrl = imageMember || '';

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
      address,
      memberId: memberId || null, // If memberId is not provided, set it to null
      googleLogin: googleLogin || false, // Default to false if not provided
      role, // Assign the role as 'user'
      imageMember: imageMemberUrl,
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
      memberId, // memberId is explicitly null
      googleLogin: googleLogin || false, // Default to false if not provided
      role, // Default role is 'user'
      imageMember
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

// exports.updateApplyMember = async (req, res, next) => {
//   try {
//     const { id } = req.params; // Get user ID from route params

//     // Update the applyMember field to false and set the role to 'member'
//     const user = await User.findByIdAndUpdate(
//       id,
//       { applyMember: false, role: 'member' }, // Set applyMember to false and role to 'member'
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Respond with success and updated user data
//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     // Handle potential errors
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.deniedApplyMember = async (req, res, next) => {
//   try {
//     const { id } = req.params; // Get user ID from route params

//     // Update the applyMember field and set memberId to an empty string for the user
//     const user = await User.findByIdAndUpdate(
//       id,
//       { applyMember: false, memberId: "" }, // Set memberId to an empty string
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Respond with success and updated user data
//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     // Handle potential errors
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

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