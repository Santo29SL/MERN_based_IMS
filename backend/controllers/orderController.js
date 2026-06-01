const Order = require("../models/Order");
const Product = require("../models/Product");
const StockLog = require("../models/StockLog");
const Restock = require("../models/Restock");
const Notification = require("../models/Notification");


// =================================
// PLACE ORDER
// =================================

const placeOrder = async (req, res) => {

    try {

        const {
            productId,
            quantity
        } = req.body;

        const product =
        await Product.findById(productId);

        if (!product) {

            return res.status(404)
            .json({
                message: "Product not found"
            });
        }

        if (product.quantity < quantity) {

            return res.status(400)
            .json({
                message: "Insufficient Stock"
            });
        }

        // Reduce Stock

        product.quantity =
        product.quantity - quantity;

        await product.save();

        // Create Order

        const order =
        await Order.create({

            customer: req.user.id,

            product: productId,

            quantity,

            totalPrice:
            product.price * quantity
        });

        // Stock Log

        await StockLog.create({

            productId,

            userId: req.user.id,

            action: "PURCHASE",

            quantity,

            reason: "Customer Order"
        });

        // Notification - New Order

        await Notification.create({

            title: "New Order",

            message:
            `New order placed for ${product.productName}`,

            type: "ORDER"
        });

        // Low Stock Check

        if (
            product.quantity <=
            product.reorderLevel
        ) {

            await Restock.create({

                productId,

                currentStock:
                product.quantity,

                requestedQuantity:
                100,

                status: "pending"
            });

            await Notification.create({

                title: "Low Stock Alert",

                message:
                `${product.productName} stock below reorder level`,

                type: "LOW_STOCK"
            });
        }

        res.status(201)
        .json(order);

    } catch (error) {

        res.status(500)
        .json({
            message: error.message
        });
    }
};


// =================================
// CUSTOMER ORDERS
// =================================

const getMyOrders =
async (req, res) => {

    try {

        const orders =
        await Order.find({

            customer:
            req.user.id

        })
        .populate("product");

        res.status(200)
        .json(orders);

    } catch (error) {

        res.status(500)
        .json({
            message: error.message
        });
    }
};


// =================================
// ADMIN ORDERS
// =================================

const getAllOrders =
async (req, res) => {

    try {

        const orders =
        await Order.find()
        .populate("customer")
        .populate("product");

        res.status(200)
        .json(orders);

    } catch (error) {

        res.status(500)
        .json({
            message: error.message
        });
    }
};


module.exports = {

    placeOrder,

    getMyOrders,

    getAllOrders
};