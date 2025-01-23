const Order = require('../models/order');
const Product = require('../models/product');
const Rider = require('../models/rider');
const Truck = require('../models/truck');
const User = require('../models/user');
const Member = require('../models/member');

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await Order.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('orderProducts.product');

    const productSales = {};

    orders.forEach(order => {
      order.orderProducts.forEach(item => {
        if (item.product) {
          const productId = item.product._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product.name,
              quantity: 0,
              totalAmount: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].totalAmount += item.quantity * item.product.price;
        }
      });
    });

    const reportData = Object.keys(productSales).map(productId => ({
      productId,
      ...productSales[productId]
    }));

    res.status(200).json({
      success: true,
      reportData
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getOrderReports = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fname lname')
      .populate('orderProducts.product', 'name');

    const preparingOrders = orders.filter(order => order.status === 'Preparing');
    const shippingOrders = orders.filter(order => order.status === 'Shipped').map(order => ({
      _id: order._id,
      user: order.user,
      deliveryAddress: order.deliveryAddress,
      orderProducts: order.orderProducts,
      status: order.status,
    }));
    const deliveredOrders = orders.filter(order => order.status === 'Delivered');

    res.status(200).json({
      success: true,
      preparingOrders,
      shippingOrders,
      deliveredOrders
    });
  } catch (error) {
    console.error('Error generating order reports:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getUserReports = async (req, res) => {
    try {
      const users = await User.find({}, 'fname lname email phone address');
      res.status(200).json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Error generating user reports:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getMemberReports = async (req, res) => {
try {
    const members = await Member.find({}, 'memberId fname lname dateOfBirth address');
    const membersWithAge = members.map(member => {
    const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    return { ...member._doc, age };
    });
    res.status(200).json({
    success: true,
    members: membersWithAge
    });
} catch (error) {
    console.error('Error generating member reports:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
};