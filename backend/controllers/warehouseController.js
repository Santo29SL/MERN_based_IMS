const Restock = require("../models/Restock");
const Product = require("../models/Product");
const Order = require("../models/Order");
const StockLog = require("../models/StockLog");
const Notification = require("../models/Notification");


// VIEW ALL RESTOCK REQUESTS

const getRestocks = async (req,res) => {

    try {

        const restocks =
        await Restock.find()
        .populate("productId");

        res.status(200).json(restocks);

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};


// COMPLETE RESTOCK

const completeRestock = async (req,res) => {

    try {

        const {
            quantityAdded
        } = req.body;

        const restock =
        await Restock.findById(
            req.params.id
        );

        if(!restock){

            return res.status(404)
            .json({
                message:
                "Restock Request Not Found"
            });
        }

        const product =
        await Product.findById(
            restock.productId
        );

        if(!product){

            return res.status(404)
            .json({
                message:
                "Product Not Found"
            });
        }

        product.quantity += quantityAdded;

        await product.save();

        restock.status = "completed";

        await restock.save();

        await StockLog.create({

            productId:
            product._id,

            userId:
            req.user.id,

            action:"RESTOCK",

            quantity:
            quantityAdded,

            reason:
            "Warehouse Restock"

        });

        res.status(200).json({

            message:
            "Restock Completed",

            product

        });
        await Notification.create({

            title:"Restock Completed",

            message:
            `${product.productName} restocked successfully`,

            type:"RESTOCK"
        });

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};


// VIEW ORDERS

const getOrders = async (req,res) => {

    try {

        const orders =
        await Order.find()
        .populate("customer")
        .populate("product");

        res.status(200).json(orders);

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};


// PACK ORDER

const packOrder = async (req,res) => {

    try {

        const order =
        await Order.findById(
            req.params.id
        );

        if(!order){

            return res.status(404)
            .json({
                message:
                "Order Not Found"
            });
        }

        order.status = "packed";

        await order.save();

        res.status(200).json({

            message:
            "Order Packed",

            order

        });
        await Notification.create({

            title:"Order Packed",

            message:
                `Order ${order._id} packed`,

            type:"PACKED"
        });

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

module.exports = {

    getRestocks,

    completeRestock,

    getOrders,

    packOrder
};