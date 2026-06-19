const Order = require("../models/Order");
const Notification = require("../models/Notification");


// Get packed orders

const getPackedOrders =
async (req, res) => {

    try {

        const orders =
        await Order.find({
            $or: [
                { status: "packed" },
                { status: "shipped", deliveryPartner: req.user.id }
            ]
        })
        .populate("customer")
        .populate("product")
        .sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Mark shipped

const shipOrder =
async (req, res) => {

    try {

        const order =
        await Order.findById(
            req.params.id
        );

        if (!order) {

            return res.status(404).json({
                message: "Order Not Found"
            });
        }

        order.status = "shipped";

        order.deliveryPartner =
        req.user.id;

        await order.save();

        res.json({
            message: "Order Shipped"
        });
        await Notification.create({

            title:"Order Shipped",

            message:
                `Order ${order._id} shipped`,

            type:"SHIPPED"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Mark delivered

const deliverOrder =
async (req, res) => {

    try {

        const order =
        await Order.findById(
            req.params.id
        );

        if (!order) {

            return res.status(404).json({
                message: "Order Not Found"
            });
        }

        order.status = "delivered";

        await order.save();

        res.json({
            message: "Order Delivered"
        });
        await Notification.create({

            title:"Order Delivered",

            message:
                `Order ${order._id} delivered`,

            type:"DELIVERED"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {

    getPackedOrders,
    shipOrder,
    deliverOrder
};