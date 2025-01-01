const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product"); // Import the Product model
const PaymongoToken = require("../models/paymongoToken");
const crypto = require("crypto");
const axios = require('axios');

const handlePayMongo = async (orderItemsDetails, temporaryLink) => {
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

    const options = {
      method: "POST",
      url: "https://api.paymongo.com/v1/checkout_sessions",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Basic c2tfbGl2ZV85eTVNaHFGcFZoRUpacEN0UEd1UE1pVkQ=`,
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
  const {
    orderProducts,
    shippingInfo,
    paymentInfo,
    itemsPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  try {
    // Ensure user information is available
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        success: false,
        message: "User information is missing",
      });
    }

    // Check stock for each item
    for (const item of orderProducts) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        console.log(`Insufficient stock for product ID: ${item.product}`);
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for one or more items",
        });
      }
    }

    // Create order in the database
    const order = await Order.create({
      user: req.user._id, // Ensure the user field is set correctly
      orderProducts,
      shippingInfo,
      paymentInfo,
      itemsPrice,
      shippingCharges,
      totalAmount,
      createdAt: Date.now(),
    });

    console.log("Created Order:", order);

    // Update stock for each item
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
        return res.status(500).json({
          success: false,
          message: "BASE_URL environment variable is not set",
        });
      }

      const temporaryLink = `${process.env.BASE_URL}/paymongo-gcash/${paymongoToken.token}/${order._id}`;
      console.log(temporaryLink, "temporaryLink");

      try {
        const checkoutUrl = await handlePayMongo(order.orderProducts, temporaryLink);
        console.log(checkoutUrl, "checkout");
        return res.json({ checkoutUrl });
      } catch (error) {
        console.error("Error generating checkout URL:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error });
      }
    }

    console.log(order);
    console.log(paymongoToken);
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
        const orders = await Order.find({});
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error); 
    }
};

exports.getMyOrders = async (req, res, next) => {

    
    const orders = await Order.find({ user: req.user._id });
    
    res.status(200).json({
        success: true,
        orders,
    });
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order Not Found",
            });
        }
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error); 
    }
};

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

        if (newStatus === "Shipped" && order.orderStatus === "Preparing") {
            order.orderStatus = newStatus;
        } else if (newStatus === "Delivered" && order.orderStatus === "Shipped") {
            order.orderStatus = newStatus;
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
      order.orderItems.forEach((item) => {
        const productId = item.product.toString();
        productSales[productId] = (productSales[productId] || 0) + item.quantity;
      });
    });

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a);
    const topProducts = await Promise.all(
      sortedProducts.slice(0, 5).map(async ([productId, quantity]) => {
        const product = await Product.findById(productId);
        return { product, quantity };
      })
    );

    res.status(200).json({
      success: true,
      topProducts,
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

