const DeliverySession = require('../models/deliverysession');
const Rider = require('../models/rider');
const Truck = require('../models/truck');
const Order = require('../models/order');
const schedule = require('node-schedule');

const markPendingOrdersAsDelivered = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await Order.updateMany(
      { status: 'Delivered Pending', createdAt: { $lte: threeDaysAgo } },
      { status: 'Delivered' }
    );

    console.log(`Updated ${result.modifiedCount} orders to Delivered`);
  } catch (error) {
    console.error('Error updating pending orders:', error);
  }
};

schedule.scheduleJob('0 0 * * *', markPendingOrdersAsDelivered);

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

    // Ensure all orders have status 'Preparing' or 'Cancelled'
    const orders = await Order.find({
      _id: { $in: orderIds },
      status: { $in: ['Preparing', 'Cancelled'] }
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({ message: 'One or more orders are not in Preparing or Cancelled status' });
    }

    // Update orders to set assignedAlready to true
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { assignedAlready: true } }
    );

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

    // Update the session status to 'Cancelled' and riderAccepted to 'Rejected'
    session.status = 'Cancelled';
    session.riderAccepted = 'Rejected';

    // Update the orders to set assignedAlready to false (unassigning the orders)
    await Order.updateMany(
      { _id: { $in: session.orders } },
      { $set: { assignedAlready: false } }
    );

    await session.save();

    res.status(200).json({ message: 'Delivery session declined', session });
  } catch (error) {
    res.status(500).json({ message: 'Error declining delivery session', error: error.message });
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


    // Set endTime in PH Time
    session.endTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      dateStyle: 'short',
      timeStyle: 'long'
    }).format(new Date());


    await session.save();


    // Set rider and truck inUse to false
    const riderUpdate = await Rider.findByIdAndUpdate(session.rider._id, { inUse: false }, { new: true }).exec();
    const truckUpdate = await Truck.findByIdAndUpdate(session.truck._id, { inUse: false }, { new: true }).exec();
   
    if (!riderUpdate || !truckUpdate) {
      return res.status(400).json({ message: 'Failed to update rider or truck inUse status' });
    }


    // Update all orders to 'Delivered'
    const updatedOrders = await Promise.all(
      session.orders.map(async (orderId) => {
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status: 'Delivered', deliveredAt: new Date() },
          { new: true }
        ).populate('user');
       
        // Send notification to the user
        if (order && order.user.deviceToken) {
          const notificationPayload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: [order.user.deviceToken],
            headings: { en: "Order Delivered" },
            contents: { en: `Your order #${order._id} has been delivered successfully.` },
            data: { orderId: order._id.toString(), status: 'Delivered' },
          };


          try {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
              headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            console.log(`Delivered notification sent successfully for order: ${order._id}`, response.data);
          } catch (error) {
            console.error(`Error sending delivered notification for order: ${order._id}`, error.response?.data || error.message);
          }
        }


        return order;
      })
    );


    console.log("Orders updated to Delivered:", updatedOrders.map(order => order._id));


    res.status(200).json({ message: 'Delivery session completed successfully', session });
  } catch (error) {
    console.error('Error completing delivery session:', error);
    res.status(500).json({ message: 'Error completing delivery session', error: error.message });
  }
};

exports.startDeliverySession = async (req, res) => {
  try {
    const { id } = req.params;


    const session = await DeliverySession.findOne({ _id: id, status: 'Ongoing' }).populate('rider truck orders');


    if (!session) {
      return res.status(404).json({ message: 'Delivery session not found or not in Ongoing status' });
    }


    // Set startTime in PH Time if it's not already set
    if (!session.startTime) {
      session.startTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        dateStyle: 'short',
        timeStyle: 'long'
      }).format(new Date());


      await session.save();
      console.log('Session startTime set:', session.startTime);
    } else {
      console.log('Session already has a startTime:', session.startTime);
    }


    // Update all orders to 'Shipped'
    const updatedOrders = await Promise.all(
      session.orders.map(async (orderId) => {
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status: 'Shipped' },
          { new: true }
        ).populate('user');


        // Send notification to the user
        if (order && order.user.deviceToken) {
          const notificationPayload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: [order.user.deviceToken],
            headings: { en: "Order Shipped" },
            contents: { en: `Your order #${order._id} has been shipped.` },
            data: { orderId: order._id.toString(), status: 'Shipped' },
          };


          try {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
              headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            console.log(`Shipped notification sent successfully for order: ${order._id}`, response.data);
          } catch (error) {
            console.error(`Error sending shipped notification for order: ${order._id}`, error.response?.data || error.message);
          }
        }


        return order;
      })
    );


    console.log("Orders updated to Shipped:", updatedOrders.map(order => order._id));


    res.status(200).json({ message: 'Delivery session started successfully', session });
  } catch (error) {
    console.error('Error starting delivery session:', error);
    res.status(500).json({ message: 'Error starting delivery session', error: error.message });
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

exports.getGroupedDeliverySessions = async (req, res) => {
  try {
    const { status } = req.query; // Get the status from the query parameter

    const groupedSessions = await DeliverySession.aggregate([
      {
        $match: {
          status: status || { $exists: true },
        },
      },
      {
        $lookup: {
          from: "riders", // Replace with your actual Rider collection name
          localField: "rider",
          foreignField: "_id",
          as: "riderDetails",
        },
      },
      {
        $lookup: {
          from: "trucks", // Replace with your actual Truck collection name
          localField: "truck",
          foreignField: "_id",
          as: "truckDetails",
        },
      },
      {
        $lookup: {
          from: "orders", // Replace with your actual Order collection name
          localField: "orders",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $unwind: "$orderDetails",
      },
      {
        $lookup: {
          from: "products", // Replace with your actual Product collection name
          localField: "orderDetails.orderProducts.product",
          foreignField: "_id",
          as: "orderDetails.productDetails",
        },
      },
      {
        $group: {
          _id: "$status",
          sessions: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          "sessions.riderDetails.password": 0, // Exclude sensitive fields if needed
          "sessions.truckDetails.sensitiveField": 0, // Adjust as necessary
        },
      },
    ]);

    res.status(200).json({
      success: true,
      groupedSessions,
    });
  } catch (error) {
    console.error("Error fetching grouped delivery sessions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPendingSessionsByRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    const sessions = await DeliverySession.find({
      rider: riderId,
      riderAccepted: 'Pending',
      status: 'Undecided'
    }).populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate('orders', 'status');

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching pending sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

exports.getOngoingSessionsByRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    // Fetch sessions categorized by their status
    const pendingSessions = await DeliverySession.find({
      rider: riderId,
      riderAccepted: 'Pending',
      status: 'Undecided'
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price'
          },
          {
            path: 'user',
            select: 'fname lname email phone deliveryAddress'
          }
        ]
      });

    const ongoingSessions = await DeliverySession.find({
      rider: riderId,
      riderAccepted: 'Accepted',
      status: 'Ongoing'
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price'
          },
          {
            path: 'user',
            select: 'fname lname email phone deliveryAddress'
          }
        ]
      });

    const rejectedSessions = await DeliverySession.find({
      rider: riderId,
      riderAccepted: 'Rejected',
      status: 'Cancelled'
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price'
          },
          {
            path: 'user',
            select: 'fname lname email phone deliveryAddress'
          }
        ]
      });

    res.status(200).json({
      success: true,
      pendingSessions,
      ongoingSessions,
      rejectedSessions
    });
  } catch (error) {
    console.error('Error fetching rider sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

exports.getSessionsByRiderId = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    // Fetch all delivery sessions linked to the riderId
    const sessions = await DeliverySession.find({ rider: riderId })
      .populate('rider', 'name') // Populate rider details if needed
      .populate('truck', 'plateNo') // Populate truck details if needed
      .populate('orders'); // Populate orders if needed

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No delivery sessions found for this rider',
      });
    }

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching delivery sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.submitProofDeliverySession = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, proofOfDelivery } = req.body;

    console.log("Request Params (id):", id);
    console.log("Order IDs:", orderId);
    console.log("Proof of Delivery:", proofOfDelivery);

    if (!orderId || !proofOfDelivery) {
      return res.status(400).json({ message: "Order IDs and proof of delivery are required." });
    }

    if (!Array.isArray(orderId)) {
      return res.status(400).json({ message: "Order IDs must be an array." });
    }

    // Find the delivery session
    const session = await DeliverySession.findById(id).populate('orders');
    console.log("Delivery Session Found:", session);

    if (!session) {
      return res.status(404).json({ message: "Delivery session not found" });
    }

    // Update all orders with the same proof of delivery and status
    const updatedOrders = await Promise.all(
      orderId.map(async (order) => {
        return await Order.findByIdAndUpdate(
          order,
          { proofOfDelivery, status: 'Delivered Pending' },
          { new: true }
        );
      })
    );

    console.log("Updated Orders:", updatedOrders);

    res.status(200).json({ message: "Proof of delivery submitted", orders: updatedOrders });
  } catch (error) {
    console.error("Error submitting proof of delivery:", error);
    res.status(500).json({ message: "Error submitting proof of delivery", error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Order ID to cancel:", orderId);

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already delivered
    if (order.status === "Delivered" || order.status === "Delivered Pending") {
      return res.status(400).json({ message: "Cannot cancel an order that has already been delivered." });
    }

    // Update order status to "Cancelled"
    order.status = "Cancelled";
    await order.save();

    console.log("Order Cancelled:", order);
    res.status(200).json({ message: "Order has been cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

exports.getSessionByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the session that includes the given orderId
    const session = await DeliverySession.findOne({ orders: orderId })
      .populate('rider', 'fname lname email phone location') // Added location field
      .populate('truck', 'model plateNo')
     

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No delivery session found for this order'
      });
    }

    // Extract the single order that matches orderId
    const matchedOrder = session.orders.length > 0 ? session.orders[0] : null;

    res.status(200).json({
      success: true,
      session: {
        _id: session._id,
        rider: session.rider,
        truck: session.truck,
        order: matchedOrder // Send only the matched order
      }
    });
  } catch (error) {
    console.error('Error fetching session by order ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};









