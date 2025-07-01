const Task = require('../models/task');
const User = require('../models/user');
const Notification = require('../models/notification');
const axios = require('axios');

exports.createTask = async (req, res) => {
  try {
    const { name, description, members, deadline } = req.body;
    
    // Validate all members exist and have role 'member'
    const foundMembers = await User.find({ 
      _id: { $in: members },
      role: 'member'
    });
    
    if (foundMembers.length !== members.length) {
      return res.status(404).json({ success: false, message: 'One or more members not found or not valid members' });
    }

    // Create the task
    const task = await Task.create({ name, description, members, deadline });

    // Create in-app notifications for assigned members
    const inAppNotifications = await Promise.all(
      foundMembers.map(user => 
        Notification.create({
          user: user._id,
          title: "New Task Assignment",
          description: `You have been assigned to a new task: "${name}". Deadline: ${new Date(deadline).toLocaleDateString()}`,
          read: false
        })
      )
    );

    console.log(`Created ${inAppNotifications.length} in-app notifications for task assignment`);

    // Send OneSignal push notifications to assigned members
    const memberPlayerIds = foundMembers
      .map(user => user.deviceToken)
      .filter(Boolean); // Remove null/undefined tokens

    if (memberPlayerIds.length > 0) {
      const taskNotification = {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: memberPlayerIds,
        headings: { en: "New Task Assignment" },
        contents: { 
          en: `You have been assigned to task: "${name}". Deadline: ${new Date(deadline).toLocaleDateString()}` 
        },
        data: { 
          taskId: task._id.toString(),
          type: 'task_assignment',
          taskName: name,
          deadline: deadline
        }
      };

      try {
        const notificationResponse = await axios.post('https://onesignal.com/api/v1/notifications', taskNotification, {
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Task assignment notification sent to ${memberPlayerIds.length} members:`, notificationResponse.data);
      } catch (notifError) {
        console.error('Error sending task assignment notification:', notifError.response?.data || notifError.message);
        // Continue execution even if notification fails
      }
    }

    // Also notify admins about the new task creation
    const admins = await User.find({ 
      role: 'admin'
    });

    let adminNotifications = [];
    let adminPlayerIds = [];

    // Create in-app notifications for admins
    if (admins.length > 0) {
      adminNotifications = await Promise.all(
        admins.map(admin => 
          Notification.create({
            user: admin._id,
            title: "New Task Created",
            description: `A new task "${name}" has been created with ${foundMembers.length} assigned member(s). Deadline: ${new Date(deadline).toLocaleDateString()}`,
            read: false
          })
        )
      );

      console.log(`Created ${adminNotifications.length} in-app notifications for admins`);

      // Send OneSignal notification to admins (only those with deviceToken)
      adminPlayerIds = admins
        .map(admin => admin.deviceToken)
        .filter(Boolean);
      
      if (adminPlayerIds.length > 0) {
        const adminNotification = {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: adminPlayerIds,
          headings: { en: "New Task Created" },
          contents: { 
            en: `New task "${name}" created with ${foundMembers.length} assigned member(s). Deadline: ${new Date(deadline).toLocaleDateString()}` 
          },
          data: { 
            taskId: task._id.toString(),
            type: 'admin_task_created',
            taskName: name,
            memberCount: foundMembers.length
          }
        };

        try {
          const adminResponse = await axios.post('https://onesignal.com/api/v1/notifications', adminNotification, {
            headers: {
              'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`Task creation notification sent to ${adminPlayerIds.length} admins:`, adminResponse.data);
        } catch (notifError) {
          console.error('Error sending admin notification:', notifError.response?.data || notifError.message);
          // Continue execution even if notification fails
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      task,
      notifications: {
        membersNotified: memberPlayerIds.length,
        adminsNotified: adminPlayerIds.length,
        inAppNotifications: {
          members: inAppNotifications.length,
          admins: adminNotifications.length
        }
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate({
      path: 'members',
      model: 'User',
      match: { role: 'member' },
      select: 'fname lname email role'
    });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'members',
      model: 'User',
      match: { role: 'member' },
      select: 'fname lname email role'
    });
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
    
    // Get the current task to compare members
    const currentTask = await Task.findById(req.params.id).populate({
      path: 'members',
      model: 'User',
      match: { role: 'member' },
      select: 'fname lname email role'
    });
    
    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Validate all members exist and have role 'member'
    if (members) {
      const foundMembers = await User.find({ 
        _id: { $in: members },
        role: 'member'
      });
      
      if (foundMembers.length !== members.length) {
        return res.status(404).json({ success: false, message: 'One or more members not found or not valid members' });
      }

      // Check for newly added members
      const currentMemberIds = currentTask.members.map(m => m._id.toString());
      const newMemberIds = members.filter(id => !currentMemberIds.includes(id));
      
      if (newMemberIds.length > 0) {
        // Get user information for new members
        const newMemberUsers = await User.find({ 
          _id: { $in: newMemberIds },
          role: 'member'
        });

        // Create in-app notifications for newly assigned members
        const newMemberNotifications = await Promise.all(
          newMemberUsers.map(user => 
            Notification.create({
              user: user._id,
              title: "Task Assignment Update",
              description: `You have been added to task: "${name}". Deadline: ${new Date(deadline).toLocaleDateString()}`,
              read: false
            })
          )
        );

        console.log(`Created ${newMemberNotifications.length} in-app notifications for newly assigned members`);

        // Send OneSignal notification to newly assigned members
        const newMemberPlayerIds = newMemberUsers
          .map(user => user.deviceToken)
          .filter(Boolean);

        if (newMemberPlayerIds.length > 0) {
          const newMemberNotification = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: newMemberPlayerIds,
            headings: { en: "Added to Task" },
            contents: { 
              en: `You have been added to task: "${name}". Deadline: ${new Date(deadline).toLocaleDateString()}` 
            },
            data: { 
              taskId: req.params.id,
              type: 'task_member_added',
              taskName: name,
              deadline: deadline
            }
          };

          try {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', newMemberNotification, {
              headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`Task update notification sent to ${newMemberPlayerIds.length} new members:`, response.data);
          } catch (notifError) {
            console.error('Error sending new member notification:', notifError.response?.data || notifError.message);
          }
        }
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { name, description, members, deadline },
      { new: true, runValidators: true }
    ).populate({
      path: 'members',
      model: 'User',
      match: { role: 'member' },
      select: 'fname lname email role'
    });

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