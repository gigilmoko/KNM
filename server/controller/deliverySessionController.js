const DeliverySession = require('../models/deliverysession');
const Rider = require('../models/rider');
const Truck = require('../models/truck');
const Order = require('../models/order');

exports.createDeliverySession = async (req, res) => {
  try {
    const { riderId, truckId, orderIds } = req.body;

    // Check if the rider and truck are available (not in use)
    const rider = await Rider.findById(riderId);
    const truck = await Truck.findById(truckId);

    if (!rider || !truck) {
      return res.status(404).json({ message: 'Rider or Truck not found' });
    }

    if (rider.inUse || truck.inUse) {
      return res.status(400).json({ message: 'Rider or Truck is already in use' });
    }

    // Ensure all orders have status 'Preparing'
    const orders = await Order.find({ _id: { $in: orderIds }, status: 'Preparing' });
    if (orders.length !== orderIds.length) {
      return res.status(400).json({ message: 'One or more orders are not in Preparing status' });
    }

    // Create the delivery session
    const newSession = new DeliverySession({
      rider: riderId,
      truck: truckId,
      orders: orderIds,
      status: 'Undecided',
      riderAccepted: 'Pending',
      startTime: null,
      endTime: null,
    });

    await newSession.save();

    res.status(201).json({ message: 'Delivery session created successfully', session: newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery session', error: error.message });
  }
};

exports.getSessions = async (req, res) => {
    try {
      const sessions = await DeliverySession.find()
        .populate('rider', 'fname lname email phone')
        .populate('truck', 'model plateNo')
        .populate('orders', 'status');
  
      res.status(200).json({ sessions });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching delivery sessions', error: error.message });
    }
  };

exports.getSessionById = async (req, res) => {
    try {
      const session = await DeliverySession.findById(req.params.id)
        .populate('rider', 'fname lname email phone')
        .populate('truck', 'model plateNo')
        .populate('orders', 'status');
  
      if (!session) {
        return res.status(404).json({ message: 'Delivery session not found' });
      }
  
      res.status(200).json({ session });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching delivery session', error: error.message });
    }
  };

  exports.acceptWork = async (req, res) => {
    try {
        const { id } = req.params; // Get the session ID from the URL parameter
        console.log('Received request to accept work for session ID:', id);

        // Find the delivery session by its ID
        const session = await DeliverySession.findById(id).populate('rider truck orders'); // Populate the related fields

        console.log('Found session:', session);

        if (!session) {
            console.log('Session not found');
            return res.status(404).json({ message: 'Delivery session not found' });
        }

        if (session.status !== 'Undecided') {
            console.log('Session status is not Undecided. Current status:', session.status);
            return res.status(404).json({ message: 'Delivery session already accepted or not in Undecided status' });
        }

        // Update the session
        session.status = 'Ongoing';
        session.riderAccepted = 'Accepted';

        console.log('Updating session status to Ongoing and riderAccepted to Accepted');

        // Set rider and truck inUse to true
        const riderUpdate = await Rider.findByIdAndUpdate(session.rider._id, { inUse: true }, { new: true }).exec();
        const truckUpdate = await Truck.findByIdAndUpdate(session.truck._id, { inUse: true }, { new: true }).exec();

        // Check if rider update was successful
        if (!riderUpdate) {
            console.log(`Failed to update rider with ID ${session.rider._id}.`);
            return res.status(400).json({ message: `Failed to update rider with ID ${session.rider._id}` });
        }

        // Check if truck update was successful
        if (!truckUpdate) {
            console.log(`Failed to update truck with ID ${session.truck._id}.`);
            return res.status(400).json({ message: `Failed to update truck with ID ${session.truck._id}` });
        }

        console.log('Rider and truck inUse updated to true');

        await session.save();

        res.status(200).json({ message: 'Delivery session accepted', session });
    } catch (error) {
        console.error('Error accepting delivery session:', error);
        res.status(500).json({ message: 'Error accepting delivery session', error: error.message });
    }
};
  
exports.declineWork = async (req, res) => {
    try {
      const { riderId, truckId } = req.body;
      const { id } = req.params;  // Get the session ID from the URL parameter
  
      // Find the delivery session by its ID
      const session = await DeliverySession.findById(id);
  
      if (!session || session.status !== 'Undecided') {
        return res.status(404).json({ message: 'Delivery session not found or already declined/accepted' });
      }
  
      // Update the session
      session.status = 'Cancelled';
      session.riderAccepted = 'Rejected';
  
      await session.save();
  
      res.status(200).json({ message: 'Delivery session declined', session });
    } catch (error) {
      res.status(500).json({ message: 'Error declining delivery session', error: error.message });
    }
  };
  
exports.deleteDeliverySession = async (req, res) => {
    try {
      const session = await DeliverySession.findByIdAndDelete(req.params.id);
  
      if (!session) {
        return res.status(404).json({ message: 'Delivery session not found' });
      }
  
      res.status(200).json({ message: 'Delivery session deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting delivery session', error: error.message });
    }
};

exports.completeDeliverySession = async (req, res) => {
    try {
      const { id } = req.params;
  
      const session = await DeliverySession.findById(id).populate('rider truck orders');
  
      if (!session || session.status !== 'Ongoing') {
        return res.status(404).json({ message: 'Delivery session not found or not in Ongoing status' });
      }
  
      session.status = 'Completed';
      session.endTime = new Date();
  
      await session.save();
  
      // Set rider and truck inUse to false
      const riderUpdate = await Rider.findByIdAndUpdate(session.rider._id, { inUse: false }, { new: true }).exec();
      const truckUpdate = await Truck.findByIdAndUpdate(session.truck._id, { inUse: false }, { new: true }).exec();
  
      if (!riderUpdate || !truckUpdate) {
        return res.status(400).json({ message: 'Failed to update rider or truck inUse status' });
      }
  
      res.status(200).json({ message: 'Delivery session completed successfully', session });
    } catch (error) {
      res.status(500).json({ message: 'Error completing delivery session', error: error.message });
    }
  };

exports.startDeliverySession = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the session with status 'Ongoing'
        const session = await DeliverySession.findOne({ _id: id, status: 'Ongoing' }).populate('rider truck orders');

        if (!session) {
            return res.status(404).json({ message: 'Delivery session not found or not in Ongoing status' });
        }

        // Set startTime to the current time if it's not already set
        if (!session.startTime) {
            session.startTime = new Date();
            await session.save();
            console.log('Session startTime set:', session.startTime);
        } else {
            console.log('Session already has a startTime:', session.startTime);
        }

        // Update all orders to 'Shipped'
        const orderUpdate = await Order.updateMany(
            { _id: { $in: session.orders.map(order => order._id) } },
            { status: 'Shipped' }
        );

        if (orderUpdate.modifiedCount === 0) {
            console.log('No orders were updated to Shipped');
            return res.status(400).json({ message: 'Failed to update order status to Shipped' });
        }

        console.log('Orders updated to Shipped:', session.orders.map(order => order._id));

        res.status(200).json({ message: 'Delivery session started successfully', session });
    } catch (error) {
        console.error('Error starting delivery session:', error);
        res.status(500).json({ message: 'Error starting delivery session', error: error.message });
    }
}





