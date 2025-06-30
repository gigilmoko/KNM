const Member = require("../models/member");
const User = require("../models/user");

exports.createMember = async (req, res) => {
    try {
      const { fname, lname, memberId } = req.body;
  
      const newMember = new Member({
        fname,
        lname,
        memberId
      });
  
      const savedMember = await newMember.save();
      res.status(201).json({
        success: true,
        data: savedMember
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // View a specific member by ID
  exports.viewMember = async (req, res) => {
    try {
      const member = await Member.findById(req.params.id);
  
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: member
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Edit a member by ID
  exports.editMember = async (req, res) => {
    try {
      const { fname, lname, memberId } = req.body;
  
      const updatedMember = await Member.findByIdAndUpdate(
        req.params.id,
        { fname, lname, memberId },
        { new: true, runValidators: true }
      );
  
      if (!updatedMember) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: updatedMember
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Delete a member by ID
  exports.deleteMember = async (req, res) => {
    try {
      const member = await Member.findByIdAndDelete(req.params.id);
  
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Member not found'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Member deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // Get all members
exports.getAllMembers = async (req, res) => {
    try {
      // Only get users with role "member" that have deviceToken (playerId)
      const memberUsers = await User.find({ 
        role: 'member',
        deviceToken: { $exists: true, $ne: null } 
      }).select('fname lname middlei email phone memberId avatar role createdAt deviceToken');
      
      // Map users to consistent format
      const allMembers = memberUsers.map(user => ({
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        middlei: user.middlei,
        email: user.email,
        phone: user.phone,
        memberId: user.memberId,
        avatar: user.avatar,
        role: user.role,
        deviceToken: user.deviceToken,
        source: 'User',
        type: 'user_member',
        createdAt: user.createdAt
      }));
  
      if (allMembers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No members with device tokens found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: allMembers,
        count: allMembers.length,
        message: `Found ${allMembers.length} members with device tokens`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };