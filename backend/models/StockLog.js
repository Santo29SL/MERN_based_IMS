const mongoose = require("mongoose");

const stockLogSchema =
new mongoose.Schema(
{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    action:{
        type:String,

        enum:[
            "ADD",
            "REMOVE",
            "PURCHASE",
            "RESTOCK"
        ]
    },

    quantity:Number,

    reason:String

},
{
    timestamps:true
}
);

module.exports =
mongoose.model(
    "StockLog",
    stockLogSchema
);