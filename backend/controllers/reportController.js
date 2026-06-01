const Product = require("../models/Product");
const Order = require("../models/Order");


// =================================
// LOW STOCK REPORT
// =================================

const lowStockReport = async (req, res) => {

    try {

        const products =
        await Product.find({
            $expr: {
                $lte: [
                    "$quantity",
                    "$reorderLevel"
                ]
            }
        });

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =================================
// OUT OF STOCK REPORT
// =================================

const outOfStockReport =
async (req, res) => {

    try {

        const products =
        await Product.find({
            quantity: 0
        });

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =================================
// SALES REPORT
// =================================

const salesReport =
async (req, res) => {

    try {

        const orders =
        await Order.find({
            status: "delivered"
        });

        let totalRevenue = 0;

        orders.forEach(order => {

            totalRevenue +=
            order.totalPrice;
        });

        res.json({

            totalOrders:
            orders.length,

            totalRevenue
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// =================================
// TOP PRODUCTS REPORT
// =================================

const topProductsReport =
async (req, res) => {

    try {

        const topProducts =
        await Order.aggregate([

            {
                $group: {

                    _id: "$product",

                    totalSold: {
                        $sum: "$quantity"
                    }
                }
            },

            {
                $sort: {
                    totalSold: -1
                }
            },

            {
                $limit: 5
            }
        ]);

        res.json(topProducts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {

    lowStockReport,

    outOfStockReport,

    salesReport,

    topProductsReport
};