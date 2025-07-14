const DeliverySession = require('../models/deliverysession');
const Rider = require('../models/rider');
const Truck = require('../models/truck');
const Order = require('../models/order');
const schedule = require('node-schedule');
const User = require('../models/user');
const Notification = require('../models/notification');


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

// Add this after the existing controllers

exports.updateDeliverySession = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId, truckId, orderIds } = req.body;

    console.log('Updating delivery session:', id);
    console.log('New data:', { riderId, truckId, orderIds });

    // Find the existing delivery session
    const session = await DeliverySession.findById(id).populate('orders');
    if (!session) {
      return res.status(404).json({ message: 'Delivery session not found' });
    }

    // Check if session can be updated (only allow updates for Ongoing status)
    if (session.status !== 'Ongoing') {
      return res.status(400).json({ message: 'Can only update ongoing delivery sessions' });
    }

    // Validate rider and truck if they are being changed
    if (riderId && riderId !== session.rider.toString()) {
      const rider = await Rider.findById(riderId);
      if (!rider) {
        return res.status(404).json({ message: 'New rider not found' });
      }
    }

    if (truckId && truckId !== session.truck.toString()) {
      const truck = await Truck.findById(truckId);
      if (!truck) {
        return res.status(404).json({ message: 'New truck not found' });
      }
    }

    // If orders are being updated
    if (orderIds && Array.isArray(orderIds)) {
      // Validate new orders - must be Preparing or Cancelled status
      const newOrders = await Order.find({
        _id: { $in: orderIds },
        status: { $in: ['Preparing', 'Cancelled', 'Shipped'] }
      }).populate('user', 'fname lname email deviceToken');

      if (newOrders.length !== orderIds.length) {
        return res.status(400).json({ message: 'One or more orders are invalid or not available for delivery' });
      }

      // Get current order IDs from session
      const currentOrderIds = session.orders.map(order => order._id.toString());
      
      // Find orders being removed (in current but not in new)
      const removedOrderIds = currentOrderIds.filter(oldId => !orderIds.includes(oldId));
      
      // Find orders being added (in new but not in current)
      const addedOrderIds = orderIds.filter(newId => !currentOrderIds.includes(newId));

      console.log('Current orders:', currentOrderIds);
      console.log('New orders:', orderIds);
      console.log('Orders being removed:', removedOrderIds);
      console.log('Orders being added:', addedOrderIds);

      // Reset status of orders that are being removed
      if (removedOrderIds.length > 0) {
        await Order.updateMany(
          { _id: { $in: removedOrderIds } },
          { $set: { status: 'Preparing', assignedAlready: false } }
        );
        console.log(`Reset ${removedOrderIds.length} removed orders to Preparing`);
      }

      // Update status of orders being added
      if (addedOrderIds.length > 0) {
        await Order.updateMany(
          { _id: { $in: addedOrderIds } },
          { $set: { status: 'Shipped', assignedAlready: true } }
        );
        console.log(`Updated ${addedOrderIds.length} added orders to Shipped`);
      }

      // Update the session with new orders
      session.orders = orderIds;
    }

    // Update rider and truck if provided
    if (riderId) {
      session.rider = riderId;
      console.log('Updated rider to:', riderId);
    }
    
    if (truckId) {
      session.truck = truckId;
      console.log('Updated truck to:', truckId);
    }

    // Save the updated session
    await session.save();

    // Populate the updated session for response
    const updatedSession = await DeliverySession.findById(id)
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        select: 'KNMOrderId status totalPrice paymentInfo address user',
        populate: {
          path: 'user',
          select: 'fname lname email'
        }
      });

    console.log('Delivery session updated successfully');

    res.status(200).json({ 
      message: 'Delivery session updated successfully', 
      session: updatedSession,
      changes: {
        riderChanged: !!riderId,
        truckChanged: !!truckId,
        ordersChanged: !!(orderIds && Array.isArray(orderIds)),
        orderCount: updatedSession.orders.length
      }
    });

  } catch (error) {
    console.error('Error updating delivery session:', error);
    res.status(500).json({ 
      message: 'Error updating delivery session', 
      error: error.message 
    });
  }
};

// Function to create a new delivery session sa
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

    // Create in-app notifications for admins through your notification model
    const Notification = require('../models/notification');
    
    // Create in-app notifications for admins
    const adminNotifications = await Promise.all(
      admins.map(admin => 
        Notification.create({
          user: admin._id,
          title: "New Delivery Session Created", 
          description: `A new delivery session has been created for rider ${rider.fname} ${rider.lname} with ${orders.length} order(s)`,
          read: false
        })
      )
    );

    console.log(`Created ${adminNotifications.length} in-app notifications for admins`);

    // Create in-app notifications for users whose orders are being shipped
    const userNotifications = await Promise.all(
      orders.map(order => {
        if (order.user && order.user._id) {
          return Notification.create({
            user: order.user._id,
            title: "Order Shipped",
            description: `Your order ${order.KNMOrderId || order._id} has been shipped and is on its way.`,
            read: false
          });
        }
        return null;
      }).filter(Boolean)
    );

    console.log(`Created ${userNotifications.length} in-app notifications for users`);

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
//this is a push
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
        customers: orders.filter(o => o.user && o.user.deviceToken).length,
        inAppNotifications: {
          admins: adminNotifications.length,
          users: userNotifications.length
        }
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
      .populate('rider', 'fname lname email phone middlei')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        select: 'KNMOrderId status totalPrice paymentInfo address user items createdAt',
        populate: {
          path: 'user',
          select: 'fname lname email'
        }
      });

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
      session.orders.map(async (order) => { // Changed from orderId to order
        const updatedOrder = await Order.findByIdAndUpdate(
          order._id, // Use order._id since session.orders contains populated order objects
          { status: 'Delivered', deliveredAt: new Date() },
          { new: true }
        ).populate('user');
       
        // Send notification to the user
        if (updatedOrder && updatedOrder.user && updatedOrder.user.deviceToken) {
          const notificationPayload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: [updatedOrder.user.deviceToken],
            headings: { en: "Order Delivered" },
            contents: { en: `Your order ${updatedOrder.KNMOrderId || updatedOrder._id} has been delivered successfully.` },
            data: { 
              orderId: updatedOrder._id.toString(), 
              status: 'Delivered',
              type: 'order_delivered'
            },
          };

          try {
            const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
              headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            console.log(`Delivered notification sent successfully for order: ${updatedOrder._id}`, response.data);
          } catch (notificationError) {
            console.error(`Error sending delivered notification for order: ${updatedOrder._id}`, notificationError.response?.data || notificationError.message);
          }
        }

        return updatedOrder;
      })
    );

    console.log("Orders updated to Delivered:", updatedOrders.map(order => order._id));

    res.status(200).json({ 
      message: 'Delivery session completed successfully', 
      session,
      deliveredOrdersCount: updatedOrders.length,
      deliveredOrders: updatedOrders.map(order => ({
        _id: order._id,
        KNMOrderId: order.KNMOrderId,
        status: order.status,
        deliveredAt: order.deliveredAt
      }))
    });
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
    const { status } = req.query;

    const groupedSessions = await DeliverySession.aggregate([
      {
        $match: {
          status: status || { $exists: true },
        },
      },
      {
        $lookup: {
          from: "riders",
          localField: "rider",
          foreignField: "_id",
          as: "riderDetails",
        },
      },
      {
        $lookup: {
          from: "trucks", 
          localField: "truck",
          foreignField: "_id",
          as: "truckDetails",
        },
      },
      {
        $lookup: {
          from: "orders",
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

    const ongoingSessions = await DeliverySession.find({
      rider: riderId,
      status: 'Ongoing',
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        match: { 
          status: { $nin: ['Delivered', 'Cancelled', 'Delivered Pending'] } // Exclude delivered and cancelled orders
        },
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
        select: 'KNMOrderId orderProducts address itemsPrice shippingCharges totalPrice paymentInfo status createdAt updatedAt',
      });

    // Filter out sessions that have no active orders after filtering
    const activeSessions = ongoingSessions.filter(session => 
      session.orders && session.orders.length > 0
    );

    console.log(`Found ${activeSessions.length} active sessions with pending orders for rider: ${riderId}`);

    // Add null checks when mapping
    const formattedSessions = activeSessions.map(session => {
      // Add null checks for session properties
      if (!session) return null;

      return {
        _id: session._id,
        startTime: session.startTime,
        status: session.status,
        rider: session.rider,
        truck: session.truck,
        orders: (session.orders || [])
          .filter(order => order && order.status !== 'Delivered' && order.status !== 'Cancelled') // Double filter for safety
          .map(order => {
            // Add null checks for order and its properties
            if (!order) return null;

            // Console log how many items are in this order
            const itemCount = order.orderProducts ? order.orderProducts.length : 0;
            console.log(`Order ${order.KNMOrderId || order._id} has ${itemCount} items`);

            const products = (order.orderProducts || []).map(item => {
              // Add null checks for product
              if (!item || !item.product) return null;

              return {
                _id: item.product._id,
                name: item.product.name || 'Unknown Product',
                price: item.price || 0,
                quantity: item.quantity || 0,
                image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null,
              };
            }).filter(Boolean); // Remove null entries

            // Console log the actual product details for this order
            console.log(`Order ${order.KNMOrderId || order._id} products:`, products.map(p => `${p.name} (qty: ${p.quantity})`));

            return {
              _id: order._id,
              KNMOrderId: order.KNMOrderId,
              customer: {
                name: order.user ? `${order.user.fname || ''} ${order.user.lname || ''}` : 'N/A',
                email: order.user?.email || 'N/A',
                phone: order.user?.contactNo || order.user?.phone || 'N/A',
              },
              address: order.address,
              products: products,
              itemCount: itemCount, // Add item count to the response
              payment: {
                method: order.paymentInfo,
                itemsPrice: order.itemsPrice || 0,
                shippingCharges: order.shippingCharges || 0,
                totalAmount: order.totalPrice || 0,
              },
              status: order.status,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
            };
          }).filter(Boolean), // Remove null entries
      };
    }).filter(Boolean); // Remove null entries

    // Console log total items across all orders for this rider
    const totalItemsCount = formattedSessions.reduce((total, session) => {
      return total + session.orders.reduce((orderTotal, order) => {
        return orderTotal + (order.itemCount || 0);
      }, 0);
    }, 0);

    console.log(`Total items across all orders for rider ${riderId}: ${totalItemsCount}`);

    res.status(200).json({
      success: true,
      ongoingSessions: formattedSessions,
      count: formattedSessions.length,
      totalItems: totalItemsCount, // Add total items to response
      message: formattedSessions.length === 0 ? 'No active delivery orders found for this rider' : undefined
    });

    // console log the data how many items in order
    console.log(`Ongoing delivery sessions for rider ${riderId}:`, formattedSessions.length);
    console.log("Ongoing delivery sessions:", formattedSessions);
  } catch (error) {
    console.error('Error fetching rider sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// In your backend - getSessionsByRiderId controller
exports.getSessionsByRiderId = async (req, res, next) => {
  try {
    const { riderId } = req.params;

    // Fetch all delivery sessions linked to the riderId
    const sessions = await DeliverySession.find({ 
      rider: riderId
    })
      .populate('rider', 'fname lname email phone')
      .populate('truck', 'model plateNo')
      .populate({
        path: 'orders',
        // Include orders that have been delivered or have proof of delivery
        match: {
          $or: [
            { status: "Delivered" },
            { status: "Delivered Pending" },
            { proofOfDelivery: { $exists: true, $ne: null } }
          ]
        },
        populate: [
          {
            path: 'orderProducts.product',
            select: 'name description price images'
          },
          {
            path: 'user',
            select: 'fname lname email phone contactNo deliveryAddress'
          }
        ],
        select: 'KNMOrderId orderProducts address itemsPrice shippingCharges totalPrice paymentInfo status createdAt updatedAt deliveredAt proofOfDelivery'
      });

    // Filter out sessions that have no delivered orders after population
    const sessionsWithDeliveredOrders = sessions.filter(session => 
      session.orders && session.orders.length > 0
    );

    if (sessionsWithDeliveredOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No delivery history found for this rider',
      });
    }

    // Format the response data
    const formattedSessions = sessionsWithDeliveredOrders.map(session => ({
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









