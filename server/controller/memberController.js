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
      // Get all members from Member model only
      const members = await Member.find({}).select('fname lname memberId');
      
      if (members.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No members found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: members,
        count: members.length,
        message: `Found ${members.length} members`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };