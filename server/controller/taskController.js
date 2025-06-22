const Task = require('../models/task');
const Member = require('../models/member');

exports.createTask = async (req, res) => {
  try {
    const { name, description, members, deadline } = req.body;
    const foundMembers = await Member.find({ _id: { $in: members } });
    if (foundMembers.length !== members.length) {
      return res.status(404).json({ success: false, message: 'One or more members not found' });
    }
    const task = await Task.create({ name, description, members, deadline });
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('members');
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('members');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { name, description, members, deadline } = req.body;
    // Validate all members exist
    if (members) {
      const foundMembers = await Member.find({ _id: { $in: members } });
      if (foundMembers.length !== members.length) {
        return res.status(404).json({ success: false, message: 'One or more members not found' });
      }
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { name, description, members, deadline },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};