const mongoose = require("mongoose");

const notificationSchema =
new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,

        enum: [
            "ORDER",
            "LOW_STOCK",
            "RESTOCK",
            "PACKED",
            "SHIPPED",
            "DELIVERED",
            "PRIORITY"
        ]
    },

    isRead: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

module.exports =
mongoose.model(
    "Notification",
    notificationSchema
);