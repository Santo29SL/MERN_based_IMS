const Product = require("../models/Product");
const Order = require("../models/Order");
const Restock = require("../models/Restock");


// ====================
// ADMIN DASHBOARD
// ====================

const adminDashboard = async (req, res) => {

    try {

        const totalProducts =
        await Product.countDocuments();

        const totalOrders =
        await Order.countDocuments();

        const pendingOrders =
        await Order.countDocuments({
            status: "pending"
        });

        const packedOrders =
        await Order.countDocuments({
            status: "packed"
        });

        const shippedOrders =
        await Order.countDocuments({
            status: "shipped"
        });

        const deliveredOrders =
        await Order.countDocuments({
            status: "delivered"
        });

        const lowStockProducts =
        await Product.countDocuments({
            $expr: {
                $lte: [
                    "$quantity",
                    "$reorderLevel"
                ]
            }
        });

        const pendingRestocks =
        await Restock.countDocuments({
            status: "pending"
        });

        res.json({

            totalProducts,

            totalOrders,

            pendingOrders,

            packedOrders,

            shippedOrders,

            deliveredOrders,

            lowStockProducts,

            pendingRestocks
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};



// ====================
// CUSTOMER DASHBOARD
// ====================

const customerDashboard =
async (req, res) => {

    try {

        const totalOrders =
        await Order.countDocuments({
            customer: req.user.id
        });

        const pendingOrders =
        await Order.countDocuments({

            customer: req.user.id,

            status: {
                $in: [
                    "pending",
                    "packed",
                    "shipped"
                ]
            }
        });

        const deliveredOrders =
        await Order.countDocuments({

            customer: req.user.id,

            status: "delivered"
        });

        res.json({

            totalOrders,

            pendingOrders,

            deliveredOrders
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};



// ====================
// WAREHOUSE DASHBOARD
// ====================

const warehouseDashboard =
async (req, res) => {

    try {

        const pendingRestocks =
        await Restock.countDocuments({
            status: "pending"
        });

        const pendingPacking =
        await Order.countDocuments({
            status: "pending"
        });

        res.json({

            pendingRestocks,

            pendingPacking
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};



// ====================
// DELIVERY DASHBOARD
// ====================

const deliveryDashboard =
async (req, res) => {

    try {

        const packedOrders =
        await Order.countDocuments({
            status: "packed"
        });

        const shippedOrders =
        await Order.countDocuments({
            status: "shipped"
        });

        const deliveredOrders =
        await Order.countDocuments({
            status: "delivered"
        });

        res.json({

            packedOrders,

            shippedOrders,

            deliveredOrders
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};



module.exports = {

    adminDashboard,

    customerDashboard,

    warehouseDashboard,

    deliveryDashboard
};