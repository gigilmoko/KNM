const Rider = require('../models/rider')
const bcrypt = require('bcryptjs'); 
const sendToken = require('../utils/jwtToken')
const Truck = require('../models/truck');
const mongoose = require('mongoose');

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

exports.getSingleRider = async (req, res, next) => {
    // console.log('Get Single Rider route hit');
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Rider ID format',
        });
    }

    try {
        const rider = await Rider.findById(id);
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

exports.riderLogin = async (req, res, next) => {
    console.log('Rider Login route hit');
    const { email, password } = req.body;
    console.log('Rider Login route hit');
    console.log('Email:', email);
    console.log('Password:', password);

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please enter email and password'
        });
    }

    // Finding rider in database
    const rider = await Rider.findOne({ email }).select('+password');

    if (!rider) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Email or Password'
        });
    }

    // Check if password is correct
    const isPasswordMatched = await rider.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({
            success: false,
            message: 'Invalid Email or Password'
        });
    }

    sendToken(rider, 200, res);
};

exports.riderLogout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
    console.log('Rider Logout route hit');
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
        const rider = await Rider.findById(req.rider.id);
    
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
    console.log('Request Body:', req.body);
    const { riderId } = req.params;
    const { oldPassword, newPassword } = req.body;  // Ensure the data matches the frontend structure
    
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

exports.getPendingTruck = async (req, res, next) => {
    try {
      // Get the rider ID from the URL parameter
      const { id: rider } = req.params;
  
      if (!rider) {
        return res.status(400).json({
          success: false,
          message: 'Rider ID is required.',
        });
      }
  
      // Find the truck based on the rider ID and pending status
      const truck = await Truck.findOne({
        rider: rider,
        riderAccepted: 'pending',
      });
  
      if (!truck) {
        return res.status(404).json({
          success: false,
          message: 'No pending truck found for this rider.',
        });
      }
  
      res.status(200).json({
        success: true,
        truck,
      });
    } catch (error) {
      console.error('Error fetching pending truck:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };

exports.riderAvailable = async (req, res) => {
    try {
        const riders = await Rider.find(); // Fetch all riders

        res.status(200).json({
            success: true,
            count: riders.length,
            data: riders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching riders',
            error: error.message,
        });
    }
};

exports.riderUnavilable = async (req, res) => {
    console.log('Unavailable');
    try {
        const inUseValue = req.query.inUse === 'false'; // Convert query string to boolean
        const riders = await Rider.find({ inUse: !inUseValue }); // Use opposite boolean value

        res.status(200).json({
            success: true,
            count: riders.length,
            data: riders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching riders',
            error: error.message,
        });
    }
};

exports.avatarUpdate = async (req, res) => {
    console.log('avatarUpdate endpoint hit'); // Log when the endpoint is accessed

    // Log the entire request body
    console.log('Request Body:', req.body); 

    const { avatar } = req.body;  // Get the avatar URL from the request body
    const riderId = req.params.id;  // Get the rider ID from the request parameters

    console.log('Rider ID from request:', riderId);
    console.log('Avatar URL from request:', avatar);

    if (!avatar) {
        return res.status(400).json({ message: "No avatar URL provided" });
    }

    try {
        // Find rider by ID
        const rider = await Rider.findById(riderId);

        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        // Update rider avatar URL in database
        rider.avatar = avatar;
        await rider.save();

        console.log('Avatar updated successfully:', rider.avatar);

        res.status(200).json({
            success: true,
            avatar: rider.avatar,
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateRiderLocation = async (req, res, next) => {   
    // console.log('Update Rider Location route hit');

    const { riderId, latitude, longitude } = req.body;

    // Validate the Rider ID format
    if (!mongoose.Types.ObjectId.isValid(riderId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Rider ID format',
        });
    }

    try {
        const rider = await Rider.findByIdAndUpdate(
            riderId,
            { location: { latitude, longitude } },
            { new: true }
        );

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: 'Rider not found',
            });
        }

        res.status(200).json({
            success: true,
            location: rider.location,
        });
    } catch (error) {
        next(error);
    }
};
