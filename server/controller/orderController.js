const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product"); // Import the Product model
const PaymongoToken = require("../models/paymongoToken");
const crypto = require("crypto");
const axios = require('axios');
const sendEmail = require("../utils/sendEmail");

const handlePayMongo = async (orderItemsDetails, shippingCharges, temporaryLink) => {
  try {
    const lineItems = await Promise.all(orderItemsDetails.map(async detail => {
      const product = await Product.findById(detail.product);
      return {
        currency: "PHP",
        amount: detail.price * detail.quantity * 100, // Amount in centavos
        name: product.name, // Ensure product name is available
        quantity: detail.quantity,
      };
    }));

    // Add shipping charges as a line item
    lineItems.push({
      currency: "PHP",
      amount: shippingCharges * 100, // Amount in centavos
      name: "Shipping Charges",
      quantity: 1,
    });

    const options = {
      method: "POST",
      url: "https://api.paymongo.com/v1/checkout_sessions",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Basic c2tfdGVzdF9QNTIyb005TEhkSDRURUcxY0JFdm1UMTY=`,
      },
      data: {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            line_items: lineItems,
            payment_method_types: ["gcash"],
            description: "Order payment",
            success_url: `${temporaryLink}`,
          },
        },
      },
    };

    console.log("PayMongo Request Options:", JSON.stringify(options, null, 2));

    const response = await axios.request(options);
    const checkoutUrl = response.data.data.attributes.checkout_url;

    return checkoutUrl; // Return the checkout URL
  } catch (error) {
    console.error("Error creating PayMongo checkout session:", error.response ? error.response.data : error.message);
    throw error;
  }
};

exports.createOrder = async (req, res, next) => {
  console.log("createOrder touched");
  console.log("Request Body:", JSON.stringify(req.body, null, 2));

  const { orderProducts, paymentInfo, itemsPrice, shippingCharges, totalPrice } = req.body;

  try {
    if (!req.user || !req.user._id) {
      console.error("Error: User information is missing");
      return res.status(400).json({
        success: false,
        message: "User information is missing",
      });
    }

    console.log("User ID:", req.user._id);

    const user = await User.findById(req.user._id);
    if (!user || !user.deliveryAddress || user.deliveryAddress.length === 0) {
      console.error("Error: User address is missing");
      return res.status(400).json({
        success: false,
        message: "User address is missing",
      });
    }

    console.log("User address found:", user.deliveryAddress[0]);

    if (typeof paymentInfo !== "string") {
      console.error("Error: Invalid paymentInfo format, received:", typeof paymentInfo);
      return res.status(400).json({
        success: false,
        message: "Invalid paymentInfo format. Expected a string.",
      });
    }

    for (const item of orderProducts) {
      console.log(`Checking stock for product ID: ${item.product}`);
      const product = await Product.findById(item.product);
      if (!product) {
        console.error(`Error: Product not found with ID: ${item.product}`);
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }
      if (product.stock < item.quantity) {
        console.error(`Error: Insufficient stock for product ID: ${item.product}`);
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for one or more items",
        });
      }
    }

    console.log("Items Price:", itemsPrice);
    console.log("Shipping Charges:", shippingCharges);
    console.log("Total Amount:", totalPrice);

    const order = await Order.create({
      user: req.user._id,
      orderProducts,
      paymentInfo,
      itemsPrice,
      shippingCharges,
      totalPrice,
      address: user.deliveryAddress[0],
      createdAt: Date.now(),
    });

    console.log("Created Order:", order);

    for (const item of orderProducts) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    const paymongoToken = await new PaymongoToken({
      orderId: order._id,
      token: crypto.randomBytes(32).toString("hex"),
      verificationTokenExpire: new Date(Date.now() + 2 * 60 * 1000),
    }).save();

    if (paymentInfo === "GCash") {
      if (!process.env.BASE_URL) {
        console.error("Error: BASE_URL environment variable is missing");
        return res.status(500).json({
          success: false,
          message: "BASE_URL environment variable is not set",
        });
      }

      const temporaryLink = `${process.env.BASE_URL}/paymongo-gcash/${paymongoToken.token}/${order._id}`;
      console.log("Temporary Payment Link:", temporaryLink);

      try {
        const checkoutUrl = await handlePayMongo(order.orderProducts, shippingCharges, temporaryLink);
        console.log("Generated Checkout URL:", checkoutUrl);
        return res.json({ checkoutUrl });
      } catch (error) {
        console.error("Error generating checkout URL:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    }

    console.log("Final Order:", order);
    console.log("Generated Token:", paymongoToken);

    // await sendOrderConfirmationEmail(order);

    res.status(200).json({
      success: true,
      order,
      message: "Order Success",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

exports.gcashPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(400).send("Invalid Link");
    }

    const user = await User.findById(order.customer);

    if (!user) {
      return res.status(400).send("User not found");
    }

    let paymongoToken = await PaymongoToken.findOne({ orderId: order._id });

    if (paymongoToken) {
      paymongoToken.token = req.params.token;
      await paymongoToken.save();
    } else {
      paymongoToken = new PaymongoToken({
        orderId: order._id,
        token: req.params.token,
      });
      await paymongoToken.save();
    }

    await order.save();

    res.status(200).json({ message: "Payment completed successfully" });
  } catch (error) {
    // Handle any other errors that may occur during the process
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAdminOrders = async (req, res, next) => {
  try {
      const orders = await Order.find({})
          .populate({
              path: "orderProducts.product",
              select: "name price", // Include the fields you need
          });

      res.status(200).json({
          success: true,
          orders,
      });
  } catch (error) {
      next(error);
  }
};

exports.getAdminOrdersMobile = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "orderProducts.product",
        select: "name price", // Include the fields you need from Product
      })
      .populate({
        path: "user",
        select: "fname lname avatar email phone", // Include the required fields from User
      });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};


exports.getMyOrders = async (req, res, next) => {
  try {
      // Fetch orders for the user and populate the user details, including the delivery address
      const orders = await Order.find({ user: req.user._id })
          .populate('user', 'fname lname middlei email phone deliveryAddress'); // Populate the necessary user fields
        console.log("Orders:", orders);
      res.status(200).json({
          success: true,
          orders,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message,
      });
  }
};

exports.getMyOrdersMobile = async (req, res, next) => {
  try {
    // Fetch orders for the user and populate the user details and product details
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'fname lname middlei email phone deliveryAddress') // Populate user details
      .populate({
        path: 'orderProducts.product', // Populate the product details
        select: 'name price image', // Fetch only necessary fields
      });

    console.log("Orders with populated products:", orders);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fname lname email address')
      .populate('orderProducts.product', 'name price images'); // Added images field

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//THIS IS FOR NOTIFICATION PURPOSES ONLY UNCOMMENT IF YOU WANT TO USE IT
// exports.processOrder = async (req, res, next) => {
//   try {
//       const order = await Order.findById(req.params.id).populate('user');
//       if (!order) {
//           return res.status(404).json({
//               success: false,
//               message: "Order Not Found",
//           });
//       }

//       const newStatus = req.body.status;
//       let notificationMessage = '';

//       if (newStatus === "Shipped" && order.status === "Preparing") {
//           order.status = newStatus;
//           notificationMessage = `Your order #${order._id} has been shipped and is on its way!`;
//       } else if (newStatus === "Delivered" && order.status === "Shipped") {
//           order.status = newStatus;
//           order.deliveredAt = new Date(Date.now());
//           notificationMessage = `Your order #${order._id} has been delivered successfully!`;
//       } else {
//           return res.status(400).json({
//               success: false,
//               message: "Invalid Status Update",
//           });
//       }

//       await order.save();

//       // Send push notification to user if they have a device token
//       if (order.user.deviceToken) {
//           const notification = {
//               app_id: process.env.ONESIGNAL_APP_ID,
//               include_player_ids: [order.user.deviceToken],
//               contents: { en: notificationMessage },
//               headings: { en: "Order Status Update" },
//               data: { 
//                   orderId: order._id.toString(),
//                   status: newStatus
//               }
//           };

//           try {
//               await axios.post('https://onesignal.com/api/v1/notifications', notification, {
//                   headers: {
//                       'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
//                       'Content-Type': 'application/json'
//                   }
//               });
//               console.log('Order status notification sent successfully');
//           } catch (error) {
//               console.error('Error sending order notification:', error);
//           }
//       }

//       res.status(200).json({
//           success: true,
//           message: "Order Processed Successfully",
//           order
//       });
//   } catch (error) {
//       next(error);
//   }
// };

exports.processOrder = async (req, res, next) => {
  try {
      const order = await Order.findById(req.params.id);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: "Order Not Found",
          });
      }

      const newStatus = req.body.status;

      if (newStatus === "Shipped" && order.status === "Preparing") {
          order.status = newStatus;
      } else if (newStatus === "Delivered" && order.status === "Shipped") {
          order.status = newStatus;
          order.deliveredAt = new Date(Date.now());
      } else {
          return res.status(400).json({
              success: false,
              message: "Invalid Status Update",
          });
      }

      await order.save();

      res.status(200).json({
          success: true,
          message: "Order Processed Successfully",
      });
  } catch (error) {
      next(error);
  }
};

exports.processOrderAny = async (req, res, next) => {
  try {
      const order = await Order.findById(req.params.id);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: "Order Not Found",
          });
      }

      // Allow updating status to any valid value
      const newStatus = req.body.status;
      if (!["Preparing", "Shipped", "Delivered", "Delivered Pending", "Cancelled"].includes(newStatus)) {
          return res.status(400).json({
              success: false,
              message: "Invalid Status Provided",
          });
      }

      order.status = newStatus;

      if (newStatus === "Delivered") {
          order.deliveredAt = new Date(Date.now());
      }

      await order.save();

      res.status(200).json({
          success: true,
          message: "Order Status Updated Successfully",
      });
  } catch (error) {
      next(error);
  }
};

exports.getDemandForecast = async (req, res) => {
    try {
      // Fetch all orders
      const orders = await Order.find();
  
      // Initialize an empty object to store sales data by month
      const salesData = {};
  
      // Loop through each order
      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          // Format date as YYYY-MM (month-year format)
          const month = moment(order.createdAt).format("YYYY-MM");
  
          const productId = item.product.toString(); // Get the product ID
  
          // Initialize the sales data for the product and month if it doesn't exist
          if (!salesData[month]) {
            salesData[month] = {};
          }
          if (!salesData[month][productId]) {
            salesData[month][productId] = 0;
          }
  
          // Accumulate the quantity for the product for the given month
          salesData[month][productId] += item.quantity;
        });
      });
  
      // Prepare the response with top 3 products for each month
      const sortedData = {};
  
      Object.keys(salesData).forEach((month) => {
        // Sort products by quantity in descending order and pick top 3
        const sortedProducts = Object.entries(salesData[month])
          .sort(([, a], [, b]) => b - a) // Sort by quantity (highest first)
          .slice(0, 3) // Pick top 3 products
          .map(([productId, quantity]) => ({ productId, quantity }));
  
        sortedData[month] = sortedProducts;
      });
  
      res.status(200).json({
        success: true,
        salesData: sortedData,
      });
    } catch (error) {
      console.error("Error in demand forecasting:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getMarketBasketAnalysis = async (req, res) => {
  try {
    const orders = await Order.find({});

    const itemPairs = {};
    orders.forEach((order) => {
      const items = order.orderItems.map((item) => item.product.toString());
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const pair = [items[i], items[j]].sort().join("-");
          itemPairs[pair] = (itemPairs[pair] || 0) + 1;
        }
      }
    });

    const sortedPairs = Object.entries(itemPairs).sort(([, a], [, b]) => b - a);

    res.status(200).json({
      success: true,
      frequentPairs: sortedPairs,
    });
  } catch (error) {
    console.error("Error in market basket analysis:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const orders = await Order.find({});

    const productSales = {};
    orders.forEach((order) => {
      if (!order.orderProducts || !Array.isArray(order.orderProducts)) {
        console.warn(`Skipping order ${order._id} due to missing or invalid orderProducts`);
        return;
      }

      order.orderProducts.forEach((item) => {
        if (!item.product) {
          console.warn(`Skipping item in order ${order._id} due to missing product`);
          return;
        }
        const productId = item.product.toString();
        productSales[productId] = (productSales[productId] || 0) + item.quantity;
      });
    });

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a);
    const topProducts = await Promise.all(
      sortedProducts.slice(0, 5).map(async ([productId, quantity]) => {
        const product = await Product.findById(productId).populate("category", "name");
        if (!product) return null; // Handle missing products
        return { 
          product: {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: {
              _id: product.category._id, 
              name: product.category.name 
            },
            stock: product.stock,
            images: product.images,
            createdAt: product.createdAt
          },
          quantity
        };
      })
    );

    res.status(200).json({
      success: true,
      topProducts: topProducts.filter(p => p !== null), // Remove null products
    });
  } catch (error) {
    console.error("Error in product popularity analysis:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.getSeasonalityAnalysis = async (req, res) => {
  try {
    const { productId } = req.params;
    const orders = await Order.find({ "orderItems.product": productId });

    const seasonalityData = orders.reduce((acc, order) => {
      const month = moment(order.createdAt).format("MMMM");
      order.orderItems.forEach((item) => {
        if (item.product.toString() === productId) {
          acc[month] = (acc[month] || 0) + item.quantity;
        }
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      seasonalityData,
    });
  } catch (error) {
    console.error("Error in seasonality analysis:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPeakOrderHours = async (req, res) => {
  try {
    // Fetch all orders
    const orders = await Order.find();

    // Initialize an object to store order count by hour (in Philippines time)
    const hourlyOrders = {};

    // Iterate through the orders and convert `createdAt` time to Philippines time
    orders.forEach((order) => {
      const orderTimeInPhilippines = moment(order.createdAt)
        .tz('Asia/Manila', true) // Convert to Philippines time
        .format('YYYY-MM-DD HH:00'); // Format time to hour-level (YYYY-MM-DD HH:00)

      // Count orders by the hour
      if (!hourlyOrders[orderTimeInPhilippines]) {
        hourlyOrders[orderTimeInPhilippines] = 0;
      }
      hourlyOrders[orderTimeInPhilippines] += 1; // Increment order count for this hour
    });

    // Convert the hourly orders object to an array of entries (key, value)
    const sortedOrders = Object.entries(hourlyOrders)
      .sort(([timeA, countA], [timeB, countB]) => countB - countA); // Sort by order count (descending)

    // Get the top 3 peak hours with most orders
    const peakHours = sortedOrders.slice(0, 3).map(([hour, count]) => ({
      hour,
      orderCount: count,
    }));

    res.status(200).json({
      success: true,
      peakHours,
    });
  } catch (error) {
    console.error("Error in peak order hours:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.calculateTotalPrice = async (req, res) => {
  try {
    const orders = await Order.find();

    // Sum up the total price from all orders
    const totalPrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      totalPrice,
    });
  } catch (error) {
    console.error("Error calculating total price:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getNumberOfOrders = async (req, res) => {
  try {
    // Count the total number of orders
    const orderCount = await Order.countDocuments();

    res.status(200).json({
      success: true,
      orderCount,
    });
  } catch (error) {
    console.error("Error fetching number of orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getMonthlyOrderTotal = async (req, res) => {
  try {
    // Aggregate orders by year and month, then sum the totalPrice
    const result = await Order.aggregate([
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          totalPrice: 1, // Include the totalPrice in the aggregation
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalPrice: { $sum: "$totalPrice" }, // Sum the totalPrice for each month
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
      },
    ]);

    // Check if results are empty
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found.",
        data: [],
      });
    }

    // Respond with the total price per month
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching monthly order totals:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getLast7DaysOrderTotal = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const result = await Order.aggregate([
      {
        $match: { createdAt: { $gte: sevenDaysAgo } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: { day: "$day" },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
    ]);

    // Convert numeric day values to day names
    const formattedResult = result.map(item => ({
      day: daysOfWeek[item._id.day - 1], // Map day number to name
      count: item.totalPrice,
    }));

    // Ensure all 7 days are included even if there's no data for some days
    const completeData = daysOfWeek.map(day => {
      const found = formattedResult.find(item => item.day === day);
      return {
        day,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: completeData,
    });
  } catch (error) {
    console.error("Error fetching past 7 days order totals:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getDailyOrderTotalByInterval = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const result = await Order.aggregate([
      {
        $match: { createdAt: { $gte: today, $lt: tomorrow } },
      },
      {
        $project: {
          interval: {
            $switch: {
              branches: [
                { case: { $lt: [{ $hour: "$createdAt" }, 4] }, then: "00:00 - 04:00" },
                { case: { $lt: [{ $hour: "$createdAt" }, 8] }, then: "04:00 - 08:00" },
                { case: { $lt: [{ $hour: "$createdAt" }, 12] }, then: "08:00 - 12:00" },
                { case: { $lt: [{ $hour: "$createdAt" }, 16] }, then: "12:00 - 16:00" },
                { case: { $lt: [{ $hour: "$createdAt" }, 20] }, then: "16:00 - 20:00" },
                { case: { $lt: [{ $hour: "$createdAt" }, 24] }, then: "20:00 - 00:00" },
              ],
              default: "Unknown",
            },
          },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: "$interval",
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: result.map(item => ({
        interval: item._id,
        totalPrice: item.totalPrice,
      })),
    });
  } catch (error) {
    console.error("Error fetching daily order totals:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getTotalCustomer = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        // Group by user ID to ensure each user is counted only once
        $group: {
          _id: "$user",
        },
      },
      {
        // Count the unique user IDs
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
        },
      },
    ]);

    const totalCustomers = result.length > 0 ? result[0].totalCustomers : 0;

    res.status(200).json({
      success: true,
      totalCustomers,
    });
  } catch (error) {
    console.error("Error fetching total customers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getOrderStatusCounts = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        // Group by the status field and count occurrences of each status
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform the result into an object for easier access
    const statusCounts = result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      statusCounts,
    });
  } catch (error) {
    console.error("Error fetching order status counts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPreparingAndCancelledOrders = async (req, res) => {
  try {
    // Find all orders where status is either "Preparing" or "Cancelled", and assignedAlready is false
    const orders = await Order.find({ 
      status: { $in: ["Preparing", "Cancelled"] }, 
      assignedAlready: false 
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found'
          });
      }

      res.status(200).json({
          success: true,
          message: 'Order deleted'
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Server error'
      });
  }
};

exports.proofOfDeliveryConfirmed = async (req, res) => {
  try {
      const { orderId } = req.params;

      let order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found',
          });
      }

      // First, mark as "Delivered Pending"
      order.status = "Delivered Pending";
      await order.save();

      // After confirmation, mark as "Delivered"
      order.status = "Delivered";
      await order.save();

      res.status(200).json({
          success: true,
          message: "Proof of Delivery confirmed. Order marked as Delivered.",
          order,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Server error",
      });
  }
};

exports.proofOfDeliveryNotConfirmed = async (req, res) => {
  try {
      const { orderId } = req.params;

      let order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found',
          });
      }

      // First, mark as "Delivered Pending"
      order.status = "Delivered Pending";
      await order.save();

      // If not confirmed, mark as "Cancelled"
      order.status = "Cancelled";
      await order.save();

      res.status(200).json({
          success: true,
          message: "Proof of Delivery not confirmed. Order marked as Cancelled.",
          order,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Server error",
      });
  }
};

exports.getPendingDeliveries = async (req, res) => {
  try {
      const pendingOrders = await Order.find({ status: "Delivered Pending" });

      if (pendingOrders.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No orders with status 'Delivered Pending' found.",
          });
      }

      res.status(200).json({
          success: true,
          message: "Pending delivery orders retrieved successfully.",
          orders: pendingOrders,
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Server error",
      });
  }
};

exports.getLatestOrders = async (req, res, next) => {
  try {
      const orders = await Order.find()
          .populate("user", "fname lname email") // Populate user details
          .populate("orderProducts.product", "name price") // Populate product details
          .sort({ createdAt: -1 }) // Sort by latest orders
          .limit(10); // Fetch only the latest 10 orders

      res.status(200).json({
          success: true,
          count: orders.length,
          orders,
      });
  } catch (error) {
      next(error);
  }
};