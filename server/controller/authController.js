const User = require("../models/user");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const express = require('express');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// exports.googleLogin = async (req, res, next) => {
//   const { tokenId } = req.body;

//   try {
//       const ticket = await client.verifyIdToken({
//           idToken: tokenId,
//           audience: process.env.GOOGLE_CLIENT_ID,
//       });

//       const { email, name, picture } = ticket.getPayload();

//       let user = await User.findOne({ email });

//       if (!user) {
//           user = new User({ email, name, avatar: picture });
//           await user.save();
//       }

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//           expiresIn: '1d',
//       });

//       res.json({ token, user });
//   } catch (error) {
//       console.error("Google Login Error:", error);
//       res.status(500).json({ error: "Google login failed." });
//   }
// };

exports.googleLogin = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email not registered" });
    }

    if (!user.googleLogin) {
      return res.status(400).json({ error: "Google login not allowed for this user" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    // Respond with success
    res.status(200).json({
      success: true,
      token,
      message: "User logged in successfully"
    });
  } catch (error) {
    // Handle errors
    next(error);
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

// //Working
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

// //Working
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
  
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
  };
  
  
// //Working
exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users,
    });
};

// //Working
// exports.getUserDetails = async (req, res, next) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     return res
//       .status(400)
//       .json({ message: `User does not found with id: ${req.params.id}` });
//     // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
//   }

//     res.status(200).json({
//         success: true,
//         user
//     })
// };

// //Working
// exports.updateUser = async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//         role: req.body.role
//     }

//     const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
//         new: true,
//         runValidators: true,
//         // useFindAndModify: false
//     })


//     return res.status(200).json({
//         success: true
//     })
// };

//Working; Doesn't delete user avatar in cloudinary
// exports.deleteUser = async (req, res, next) => {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//         return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
//         // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
//     }

//     // Remove avatar from cloudinary
//         // const image_id = user.avatar.public_id;
//         // await cloudinary.v2.uploader.destroy(image_id);
//     await User.findByIdAndRemove(req.params.id);
//     return res.status(200).json({
//         success: true,
//     })
// };

//Needs Frontend
// c

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

// //Needs Frontend
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
// //Needs Frontend
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

  

// exports.updateProfile = async (req, res, next) => {
//   try {
//     const newUserData = {
//       name: req.body.name,
//       email: req.body.email
//     };

//     if (req.files && req.files.avatar) {
//       const user = await User.findById(req.user.id);

//       const uploadedAvatar = await cloudinary.v2.uploader.upload(req.files.avatar.path, {
//         folder: 'avatars',
//         width: 150,
//         crop: 'scale'
//       });

//       newUserData.avatar = uploadedAvatar.secure_url;

//       // Delete the previous avatar from Cloudinary (if exists)
//       if (user.avatar) {
//         await cloudinary.v2.uploader.destroy(user.avatar);
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedUser) {
//       return res.status(401).json({ success: false, message: 'User Not Updated' });
//     }

//     res.status(200).json({
//       success: true,
//       user: updatedUser
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };


// exports.checkEmail = async (req, res, next) => {
//     try {
//       const { email } = req.query;
//       const existingUser = await User.findOne({ email });
  
//       res.status(200).json({
//         exists: !!existingUser,
//       });
//     } catch (error) {
//       console.error("Error checking email:", error);
//       res.status(500).json({
//         error: "Internal Server Error",
//       });
//     }
// };
  
// exports.google = async (req, res, next) => {
//     try {
//       const { email, name, avatar } = req.body;
  
//       // Check if the user already exists
//       const existingUser = await User.findOne({ email });
  
//       let avatarData;
  
//       if (avatar) {
//         // Upload avatar to Cloudinary
//         await cloudinary.v2.uploader.upload(
//           avatar,
//           {
//             folder: "avatars",
//             width: 150,
//             crop: "scale",
//           },
//           (err, result) => {
//             if (err) {
//               console.error("Error uploading avatar to Cloudinary:", err);
//               throw err;
//             }
//             avatarData = {
//               public_id: result.public_id,
//               url: result.secure_url,
//             };
//           }
//         );
//       }
  
//       if (existingUser) {
//         // User exists, log in the user
//         // You may generate a token or create a session here
//         sendToken(existingUser, 200, res);
//       } else {
//         // User doesn't exist, create a new user
//         const randomPassword = Math.random().toString(36).slice(-8);
//         const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
//         const newUser = new User({
//           name,
//           email,
//           password: hashedPassword,
//           avatar: avatarData,
//         });
  
//         await newUser.save();
  
//         // Log in the new user
//         sendToken(newUser, 201, res);
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
// };
  
// exports.facebook = async (req, res, next) => {
//     try {
//       const { email, name, avatar } = req.body;
  
//       // Check if the user already exists
//       const existingUser = await User.findOne({ email });
  
//       let avatarData;
  
//       if (avatar) {
//         // Upload avatar to Cloudinary
//         await cloudinary.v2.uploader.upload(
//           avatar,
//           {
//             folder: "profiles",
//             width: 200,
//             crop: "scale",
//           },
//           (err, result) => {
//             if (err) {
//               console.error("Error uploading avatar to Cloudinary:", err);
//               throw err;
//             }
//             avatarData = {
//               public_id: result.public_id,
//               url: result.url,
//             };
//           }
//         );
//       }
  
//       if (existingUser) {
//         // User exists, log in the user
//         // You may generate a token or create a session here
//         sendToken(existingUser, 200, res);
//       } else {
//         // User doesn't exist, create a new user
//         const randomPassword = Math.random().toString(36).slice(-8);
//         const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
//         const newUser = new User({
//           name,
//           email,
//           password: hashedPassword,
//           avatar: avatarData,
//         });
  
//         await newUser.save();
  
//         // Log in the new user
//         sendToken(newUser, 201, res);
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }

    
// };

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