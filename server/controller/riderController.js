const Rider = require('../models/rider')
const bcrypt = require('bcryptjs'); 

exports.getRider = async (req, res, next) => {
    try {
        const riders = await Rider.find();
        if (!riders || riders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Riders Found'
            });
        }
        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        next(error);
    }
};

exports.newRider = async (req, res, next) => {
    const rider = await Rider.create(req.body);
    if (!rider) {
        return res.status(400).json({
            success: false,
            message: 'Rider not created'
        });
    }
    res.status(201).json({
        success: true,
        rider
    });
};      

exports.getSingleRider = async (req, res, next) => {
    const rider = await Rider.findById(req.params.id);
    if (!rider) {
        return res.status(404).json({
            success: false,
            message: 'Rider not found'
        })
    }
    res.status(200).json({
        success: true,
        rider
    })
}

exports.updateRider = async (req, res, next) => {
    try {
        let rider = await Rider.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true 
            }
        );
        if (!rider) {
            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            })
        }
        res.status(200).json({
            success: true,
            rider
        })
    } catch (error) {
        next(error);
    }
}

exports.deleteRider = async (req, res, next) => {
    try {
        const rider = await Rider.findByIdAndDelete(req.params.id);
        if (!rider) {
            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Rider deleted'
        })
    } catch (error) {
        next(error);
    }
}

exports.riderLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please enter email and password'
        });
    }
    const rider = await Rider.findOne({ email }).select('+password');
    if (!rider) {
        return res.status(404).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    const isMatch = await rider.comparePassword(password);
    if (!isMatch) {
        return res.status(404).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    const token = rider.getJwtToken();
    res.status(200).json({
        success: true,
        token
    });
}

exports.riderLogout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
}   //

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

exports.riderProfile = async (req, res, next) => {
    try {
        // Retrieve rider data based on rider ID from request object
        const rider = await Rider.findById(req.user.id);
    
        // Check if rider exists
        if (!rider) {
          return res.status(404).json({
            success: false,
            message: "Rider not found",
          });
        }
    
        // If rider exists, return rider data
        res.status(200).json({
          success: true,
          rider,
        });
      } catch (error) {
        console.error("Error fetching rider profile:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
};

exports.updatePassword = async (req, res, next) => {
    console.log('Update Password route hit');
    
    const { riderId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!riderId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Rider ID, old password, and new password are required" });
    }

    try {
        const rider = await Rider.findById(riderId).select("password");
        if (!rider) {
            return res.status(404).json({ message: "Rider not found" });
        }

        // Compare the old password with the stored password
        const isMatch = await bcrypt.compare(oldPassword, rider.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Update the rider's password
        rider.password = newPassword;
        await rider.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: "An error occurred while updating the password" });
    }
};