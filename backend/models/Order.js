const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    quantity: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "pending",
            "packed",
            "shipped",
            "delivered"
        ],
        default: "pending"
    },

    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true
}
);

module.exports =
mongoose.model(
    "Order",
    orderSchema
);