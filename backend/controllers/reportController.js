const Product = require("../models/Product");
const Order = require("../models/Order");
const Notification = require("../models/Notification");


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


// =================================
// ADVANCED ANALYTICS REPORT
// =================================

const advancedAnalyticsReport = async (req, res) => {
    try {
        // 1. Best Selling Category
        const bestCategories = await Order.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalSold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { totalSold: -1 } }
        ]);

        // 2. Product Peak Hour and Month
        const rawTimeMetrics = await Order.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    productId: "$product",
                    productName: "$productDetails.productName",
                    category: "$productDetails.category",
                    month: { $month: "$createdAt" },
                    hour: { $hour: "$createdAt" },
                    quantity: 1
                }
            },
            {
                $group: {
                    _id: {
                        productId: "$productId",
                        productName: "$productName",
                        category: "$category",
                        month: "$month",
                        hour: "$hour"
                    },
                    unitsSold: { $sum: "$quantity" }
                }
            },
            { $sort: { unitsSold: -1 } }
        ]);

        const productPeaks = {};
        rawTimeMetrics.forEach(item => {
            const prodId = item._id.productId.toString();
            if (!productPeaks[prodId]) {
                productPeaks[prodId] = {
                    productId: prodId,
                    productName: item._id.productName,
                    category: item._id.category,
                    peakMonth: item._id.month,
                    peakHour: item._id.hour,
                    unitsSold: item.unitsSold
                };
            }
        });

        // 3. Customer Purchase Frequency (Repetitive buyers)
        const customerMetrics = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "customer",
                    foreignField: "_id",
                    as: "customerDetails"
                }
            },
            { $unwind: "$customerDetails" },
            {
                $group: {
                    _id: "$customerDetails._id",
                    customerName: { $first: "$customerDetails.name" },
                    customerEmail: { $first: "$customerDetails.email" },
                    orderCount: { $sum: 1 },
                    totalSpend: { $sum: "$totalPrice" }
                }
            },
            { $sort: { orderCount: -1 } }
        ]);

        // 4. Summaries
        const cancelledCount = await Order.countDocuments({ status: "cancelled" });
        const priorityNudgeCount = await Notification.countDocuments({ type: "PRIORITY" });

        res.status(200).json({
            bestCategories,
            productPeaks: Object.values(productPeaks),
            customerMetrics,
            cancelledCount,
            priorityNudgeCount
        });
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

    topProductsReport,

    advancedAnalyticsReport
};