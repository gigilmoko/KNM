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

exports.newTruck = async (req, res, next) => {
    const truck = await Truck.create(req.body);
    if (!truck) {
        return res.status(400).json({
            success: false,
            message: 'Truck not created'
        });
    }
    res.status(201).json({
        success: true,
        truck
    });
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

exports.updateTruck = async (req, res, next) => {
    try {
        let truck = await Truck.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true 
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
        next(error);
    }
}

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

exports.assignRider = async (req, res, next) => {
    try {
        const { id } = req.params; // Truck ID
        const { riderId } = req.body; // Rider ID

        console.log(`Assigning truck with ID: ${id}`);
        console.log(`Assigning rider with ID: ${riderId}`);

        // Ensure IDs are valid
        if (!id || !riderId) {
            return res.status(400).json({ success: false, message: "Invalid truck ID or rider ID" });
        }

        // Find the truck by ID
        const truck = await Truck.findById(id);
        if (!truck) {
            return res.status(404).json({ success: false, message: "Truck not found" });
        }

        // Assign rider
        truck.rider = riderId; // Assuming `rider` is the field in the truck schema
        truck.assigned = true;

        // Save truck
        await truck.save();

        console.log(`Truck ${id} successfully assigned to rider ${riderId}`);

        return res.status(200).json({ success: true, truck });
    } catch (error) {
        console.error('Error in assignRider:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.unassignRider = async (req, res, next) => {
    try {
        let truck = await Truck.findById(req.params.id);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }
        truck = await Truck.findByIdAndUpdate(
            req.params.id,
            { rider: null },
            {
                new: true,
                runValidators: true
            }
        );
        res.status(200).json({
            success: true,
            truck
        });
    } catch (error) {
        next(error);
    }
}

exports.getTruckOrders = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.id).populate('orders');
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }
        res.status(200).json({
            success: true,
            orders: truck.orders
        });
    } catch (error) {
        next(error);
    }
}

exports.addTruckOrder = async (req, res, next) => {
    try {
        let truck = await Truck.findById(req.params.id);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found'
            });
        }
        const order = await Order.create(req.body);
        truck.orders.push(order._id);
        await truck.save();
        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
}

exports.removeSingleTruckOrder = async (req, res, next) => {
    try {
        let truck = await Truck.findById(req.params.id);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found',
            });
        }

        const initialOrdersLength = truck.orders.length;
        truck.orders = truck.orders.filter(orderId => orderId.toString() !== req.params.orderId);

        if (truck.orders.length === initialOrdersLength) {
            return res.status(404).json({
                success: false,
                message: 'Order not found in truck',
            });
        }

        await truck.save();

        res.status(200).json({
            success: true,
            message: 'Order removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

exports.removeAllTruckOrders = async (req, res, next) => {
    try {
        let truck = await Truck.findById(req.params.id);
        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'Truck not found',
            });
        }

        truck.orders = []; // Clear all orders
        await truck.save();

        res.status(200).json({
            success: true,
            message: 'All orders removed successfully',
        });
    } catch (error) {
        next(error);
    }
};
