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

    // Ensure all orders have status 'Preparing' or 'Cancelled'
    const orders = await Order.find({
      _id: { $in: orderIds },
      status: { $in: ['Preparing', 'Cancelled'] }
    }).populate('user', 'fname lname email deviceToken');

    if (orders.length !== orderIds.length) {
      return res.status(400).json({ message: 'One or more orders are not in Preparing or Cancelled status' });
    }

    // Update order status to 'Shipped'
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: 'Shipped', assignedAlready: true } }
    );

    // Create the delivery session
    const newSession = new DeliverySession({
      rider: riderId,
      truck: truckId,
      orders: orderIds,
      status: 'Ongoing',
      startTime: null,
      endTime: null,
    });

    await newSession.save();

    // Fetch admin users for notifications
    const admins = await User.find({ 
      role: 'admin', 
      deviceToken: { $exists: true, $ne: null } 
    });

    // Send OneSignal notification to the assigned rider
    if (rider.deviceToken) {
      const orderNumbers = orders.map(order => order.KNMOrderId || order._id).join(', ');
      
      const riderNotification = {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [rider.deviceToken],
        headings: { en: "New Delivery Assignment" },
        contents: { 
          en: `You have been assigned a new delivery with ${orders.length} order(s): ${orderNumbers}` 
        },
        data: { 
          sessionId: newSession._id.toString(),
          type: 'new_delivery_assignment',
          orders: orderIds
        }
      };

      try {
        const axios = require('axios');
        const riderResponse = await axios.post('https://onesignal.com/api/v1/notifications', riderNotification, {
          headers: {
            'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Delivery assignment notification sent to rider ${rider.fname} ${rider.lname}:`, riderResponse.data);
      } catch (notifError) {
        console.error(`Error sending notification to rider:`, notifError.response?.data || notifError.message);
        // Continue execution even if notification fails
      }
    }

    // Send OneSignal notification to admins
    if (admins.length > 0) {
      const adminPlayerIds = admins.map(admin => admin.deviceToken).filter(Boolean);
      
      if (adminPlayerIds.length > 0) {
        const adminNotification = {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: adminPlayerIds,
          headings: { en: "New Delivery Session Created" },
          contents: { 
            en: `A new delivery session has been created for ${rider.fname} ${rider.lname} with ${truck.model} (${truck.plateNo}) for ${orders.length} orders.` 
          },
          data: { 
            sessionId: newSession._id.toString(),
            type: 'admin_delivery_created' 
          }
        };
        
        try {
          const axios = require('axios');
          const adminResponse = await axios.post('https://onesignal.com/api/v1/notifications', adminNotification, {
            headers: {
              'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`Delivery creation notification sent to ${adminPlayerIds.length} admins:`, adminResponse.data);
        } catch (notifError) {
          console.error(`Error sending notification to admins:`, notifError.response?.data || notifError.message);
          // Continue execution even if notification fails
        }
      }
    }

    // Notify customers that their orders are shipped
    for (const order of orders) {
      if (order.user && order.user.deviceToken) {
        const customerNotification = {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: [order.user.deviceToken],
          headings: { en: "Order Shipped" },
          contents: { 
            en: `Your order ${order.KNMOrderId || order._id} has been shipped and is on its way.` 
          },
          data: { 
            orderId: order._id.toString(),
            status: 'Shipped',
            type: 'order_status_update'
          }
        };
        
        try {
          const axios = require('axios');
          await axios.post('https://onesignal.com/api/v1/notifications', customerNotification, {
            headers: {
              'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`Order shipped notification sent to customer for order ${order._id}`);
        } catch (notifError) {
          console.error(`Error sending notification to customer for order ${order._id}:`, notifError.response?.data || notifError.message);
          // Continue execution even if notification fails
        }
      }
    }

    res.status(201).json({ 
      message: 'Delivery session created successfully', 
      session: newSession,
      notificationsSent: {
        rider: !!rider.deviceToken,
        admins: admins.length,
        customers: orders.filter(o => o.user && o.user.deviceToken).length
      }
    });
  } catch (error) {
    console.error('Error creating delivery session:', error);
    res.status(500).json({ message: 'Error creating delivery session', error: error.message });
  }
};
// old assigning delivery session to a rider and truck
// exports.createDeliverySession = async (req, res) => {
//   try {
//     const { riderId, truckId, orderIds } = req.body;

//     // Check if the rider and truck are available (not in use)
//     const rider = await Rider.findById(riderId);
//     const truck = await Truck.findById(truckId);

//     if (!rider || !truck) {
//       return res.status(404).json({ message: 'Rider or Truck not found' });
//     }

//     // Ensure all orders have status 'Preparing' or 'Cancelled'
//     const orders = await Order.find({
//       _id: { $in: orderIds },
//       status: { $in: ['Preparing', 'Cancelled'] }
//     });

//     if (orders.length !== orderIds.length) {
//       return res.status(400).json({ message: 'One or more orders are not in Preparing or Cancelled status' });
//     }

//     // Update order status to 'Shipped'
//     await Order.updateMany(
//       { _id: { $in: orderIds } },
//       { $set: { status: 'Shipped', assignedAlready: true } }
//     );

//     // Create the delivery session
//     const newSession = new DeliverySession({
//       rider: riderId,
//       truck: truckId,
//       orders: orderIds,
//       status: 'Ongoing',
//       startTime: null,
//       endTime: null,
//     });

//     await newSession.save();

//     res.status(201).json({ message: 'Delivery session created successfully', session: newSession });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating delivery session', error: error.message });
//   }
// };

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

    // Update order status to 'Cancelled'
    await Order.updateMany(
      { _id: { $in: session.orders } },
      { $set: { status: 'Cancelled', assignedAlready: false } }
    );

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

exports.getOngoingSessionsByRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    // Fetch sessions categorized by their status
    const ongoingSessions = await DeliverySession.find({
      rider: riderId,
      status: 'Ongoing',
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price images',
          },
          {
            path: 'user',
            select: 'fname lname email phone contactNo deliveryAddress',
          },
        ],
        // Include more order fields including shipping charges and total price
        select: 'KNMOrderId orderProducts address itemsPrice shippingCharges totalPrice paymentInfo status createdAt UpdatedAt',
      });

    // Format the response data for better client consumption
    const formattedSessions = ongoingSessions.map(session => {
      return {
        _id: session._id,
        startTime: session.startTime,
        status: session.status,
        rider: session.rider,
        truck: session.truck,
        orders: session.orders.map(order => ({
          _id: order._id,
          KNMOrderId: order.KNMOrderId,
          customer: {
            name: `${order.user.fname} ${order.user.lname}`,
            email: order.user.email,
            phone: order.user.contactNo || order.user.phone,
          },
          address: order.address,
          products: order.orderProducts.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null,
          })),
          payment: {
            method: order.paymentInfo,
            itemsPrice: order.itemsPrice,
            shippingCharges: order.shippingCharges,
            totalAmount: order.totalPrice,
          },
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
      };
    });

    res.status(200).json({
      success: true,
      ongoingSessions: formattedSessions,
      count: formattedSessions.length,
    });
  } catch (error) {
    console.error('Error fetching rider sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.getSessionsByRiderId = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    // Fetch all delivery sessions linked to the riderId with focus on completed sessions
    const sessions = await DeliverySession.find({ 
      rider: riderId,
      status: { $in: ['Completed'] } // Focus on completed sessions
    })
      .populate('rider', 'fname lname email phone') // Get rider details
      .populate('truck', 'model plateNo') // Get truck details
      .populate({
        path: 'orders',
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price images' // Include product images
          },
          {
            path: 'user',
            select: 'fname lname email phone contactNo deliveryAddress'
          }
        ],
        // Include comprehensive order information
        select: 'KNMOrderId orderProducts address itemsPrice shippingCharges totalPrice paymentInfo status createdAt updatedAt deliveredAt proofOfDelivery'
      });

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed delivery sessions found for this rider',
      });
    }

    // Format the response data for better client consumption
    const formattedSessions = sessions.map(session => ({
      _id: session._id,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      createdAt: session.createdAt,
      rider: {
        _id: session.rider._id,
        name: `${session.rider.fname} ${session.rider.lname}`,
        email: session.rider.email,
        phone: session.rider.phone
      },
      truck: {
        _id: session.truck._id,
        model: session.truck.model,
        plateNo: session.truck.plateNo
      },
      orders: session.orders.map(order => ({
        _id: order._id,
        KNMOrderId: order.KNMOrderId,
        customer: {
          name: order.user ? `${order.user.fname} ${order.user.lname}` : 'N/A',
          email: order.user ? order.user.email : 'N/A',
          phone: order.user ? (order.user.contactNo || order.user.phone) : 'N/A'
        },
        address: order.address,
        products: order.orderProducts.map(item => ({
          _id: item.product ? item.product._id : '',
          name: item.product ? item.product.name : 'Product Unavailable',
          price: item.price,
          quantity: item.quantity,
          image: item.product && item.product.images && item.product.images.length > 0 
                 ? item.product.images[0].url 
                 : null
        })),
        payment: {
          method: order.paymentInfo,
          itemsPrice: order.itemsPrice,
          shippingCharges: order.shippingCharges,
          totalAmount: order.totalPrice
        },
        status: order.status,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        updatedAt: order.updatedAt,
        proofOfDelivery: order.proofOfDelivery || null
      }))
    }));

    res.status(200).json({
      success: true,
      sessionsCount: formattedSessions.length,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error("Error fetching delivery sessions history:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
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









