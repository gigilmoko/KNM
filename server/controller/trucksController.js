const Order = require('../models/order'); // Corrected path
const Truck = require('../models/truck'); // Corrected path

exports.getTruck = async (req, res, next) => {
    try {
        const trucks = await Truck.find();
        if (!trucks || trucks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Trucks Found'
            });
        }
        res.status(200).json({
            success: true,
            count: trucks.length,
            trucks
        });
    } catch (error) {
        next(error);
    }
};

exports.getSingleTruck = async (req, res, next) => {
    const truck = await Truck.findById(req.params.id);
    if (!truck) {
        return res.status(404).json({
            success: false,
            message: 'Truck not found'
        })
    }
    res.status(200).json({
        success: true,
        truck
    })
}


exports.newTruck = async (req, res, next) => {
    try {
        // Create a new truck using the data from the request body
        const truck = await Truck.create({
            model: req.body.model,
            plateNo: req.body.plateNo,
            inUse: req.body.inUse || false  // Default to false if not provided
        });
        
        res.status(201).json({
            success: true,
            truck
        });
    } catch (error) {
        // If there's an error, pass it to the next middleware
        next(error);
    }
};  
 

exports.updateTruck = async (req, res, next) => {
    try {
        // Find the truck by its ID and update with the new data
        let truck = await Truck.findByIdAndUpdate(
            req.params.id, 
            {
                model: req.body.model,
                plateNo: req.body.plateNo,
                inUse: req.body.inUse !== undefined ? req.body.inUse : false // Default to false if not provided
            }, 
            {
                new: true, // Return the updated truck
                runValidators: true // Ensure validation is applied
            }
        );
        
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }
        
        res.status(200).json({
            success: true,
            truck
        });
    } catch (error) {
        next(error);  // If there's an error, pass it to the error handler
    }
};

exports.deleteTruck = async (req, res, next) => {
    try {
        let truck = await Truck.findByIdAndDelete(req.params.id);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Truck deleted'
        });
    } catch (error) {
        next(error);
    }
}

// exports.assignRider = async (req, res, next) => {
//     console.log('Assigning rider to truck');
//     try {
//         const { id } = req.params; // Truck ID
//         const { riderId } = req.body; // Rider ID

//         console.log(`Assigning truck with ID: ${id}`);
//         console.log(`Assigning rider with ID: ${riderId}`);

//         // Ensure IDs are valid
//         if (!id || !riderId) {
//             return res.status(400).json({ success: false, message: "Invalid truck ID or rider ID" });
//         }

//         // Find the truck by ID
//         const truck = await Truck.findById(id);
//         if (!truck) {
//             return res.status(404).json({ success: false, message: "Truck not found" });
//         }

//         // Assign rider
//         truck.rider = riderId; // Assuming `rider` is the field in the truck schema
//         truck.assigned = true;

//         // Save truck
//         await truck.save();

//         console.log(`Truck ${id} successfully assigned to rider ${riderId}`);

//         return res.status(200).json({ success: true, truck });
//     } catch (error) {
//         console.error('Error in assignRider:', error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }

// exports.unassignRider = async (req, res, next) => {
//     try {
//         let truck = await Truck.findById(req.params.id);
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found'
//             });
//         }
//         truck = await Truck.findByIdAndUpdate(
//             req.params.id,
//             { rider: null },
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );
//         res.status(200).json({
//             success: true,
//             truck
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// exports.getTruckOrders = async (req, res, next) => {
//     try {
//         const truck = await Truck.findById(req.params.id).populate('orders');
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found'
//             });
//         }
//         res.status(200).json({
//             success: true,
//             orders: truck.orders
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// // Add Order to Truck and set insideTruck to true
// exports.addTruckOrder = async (req, res, next) => {
//     try {
//         let truck = await Truck.findById(req.params.id);
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found'
//             });
//         }

//         let order = await Order.findById(req.params.orderId);
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         // Add the order ID to the truck's orders array
//         truck.orders.push(order._id);
        
//         // Set insideTruck to true for the order
//         order.insideTruck = true;
//         await order.save();

//         // Save the truck with the updated orders
//         await truck.save();

//         res.status(200).json({
//             success: true,
//             order
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // Remove Single Order from Truck and set insideTruck to false
// exports.removeSingleTruckOrder = async (req, res, next) => {
//     console.log('Removing single order from truck');
//     try {
//         let truck = await Truck.findById(req.params.id);
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found',
//             });
//         }

//         const initialOrdersLength = truck.orders.length;
//         truck.orders = truck.orders.filter(orderId => orderId.toString() !== req.params.orderId);

//         if (truck.orders.length === initialOrdersLength) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found in truck',
//             });
//         }

//         // Find the order and set insideTruck to false
//         let order = await Order.findById(req.params.orderId);
//         if (order) {
//             order.insideTruck = false;
//             await order.save();
//         }

//         await truck.save();

//         res.status(200).json({
//             success: true,
//             message: 'Order removed successfully',
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // Remove All Orders from Truck and set insideTruck to false for all orders
// exports.removeAllTruckOrders = async (req, res, next) => {
//     console.log("removeAll orders");
//     try {
//         let truck = await Truck.findById(req.params.id);
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found',
//             });
//         }

//         // Check if the truck has any orders
//         if (!truck.orders || truck.orders.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'No orders found in truck',
//             });
//         }

//         // Find each order and set insideTruck to false
//         const orders = await Order.find({ '_id': { $in: truck.orders } });
//         for (let order of orders) {
//             order.insideTruck = false;
//             await order.save();
//         }

//         // Clear all orders from the truck
//         truck.orders = [];
//         await truck.save();

//         res.status(200).json({
//             success: true,
//             message: 'All orders removed successfully',
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// exports.acceptedWork = async (req, res, next) => {
//     try {
//         // Find the truck by ID and populate the associated orders
//         let truck = await Truck.findById(req.params.id).populate('orders');
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found'
//             });
//         }

//         // Extract riderId from the request body
//         const { riderId } = req.body;

//         // Check if the provided riderId matches the truck's assigned rider
//         if (truck.rider.toString() !== riderId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized: You are not assigned to this truck'
//             });
//         }

//         // Update the truck's riderAccepted status to "accepted"
//         truck.riderAccepted = 'accepted';

//         // Update all assigned orders to "Shipped"
//         for (let order of truck.orders) {
//             order.status = 'Shipped';
//             await order.save();
//         }

//         // Save the updated truck data
//         await truck.save();

//         // Respond with the success message and updated truck data
//         res.status(200).json({
//             success: true,
//             message: 'Work accepted, orders are shipped',
//             truck
//         });
//     } catch (error) {
//         next(error);  // Pass error to the error handling middleware
//     }
// };

// exports.declinedWork = async (req, res, next) => {
//     try {
//         // Find the truck by ID and populate the associated orders
//         let truck = await Truck.findById(req.params.id).populate('orders');
//         if (!truck) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Truck not found'
//             });
//         }

//         // Extract riderId from the request body
//         const { riderId } = req.body;

//         // Check if the provided riderId matches the truck's assigned rider
//         if (truck.rider.toString() !== riderId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Unauthorized: You are not assigned to this truck'
//             });
//         }

//         // Update the truck's riderAccepted status to "rejected"
//         truck.riderAccepted = 'rejected';

//         // Retain order status and remove the rider from the truck
//         truck.rider = null;

//         // Save the updated truck data
//         await truck.save();

//         // Respond with the success message and updated truck data
//         res.status(200).json({
//             success: true,
//             message: 'Work declined, rider removed from truck',
//             truck
//         });
//     } catch (error) {
//         next(error);  // Pass error to the error handling middleware
//     }
// };

exports.truckAvailable = async (req, res) => {
    // console.log('Available Trucks');
    try {
        
        const trucks = await Truck.find();

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trucks',
            error: error.message,
        });
    }
};

exports.truckUnavailable = async (req, res) => {
    console.log('Unavailable Trucks');
    try {
        const inUseValue = req.query.inUse === 'false'; // Convert query string to boolean
        const trucks = await Truck.find({ inUse: !inUseValue }); // Use opposite boolean value

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trucks',
            error: error.message,
        });
    }
};
