const mongoose = require("mongoose");

const restockSchema =
new mongoose.Schema(
{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },

    currentStock:Number,

    requestedQuantity:Number,

    status:{
        type:String,

        enum:[
            "pending",
            "approved",
            "completed"
        ],

        default:"pending"
    }

},
{
    timestamps:true
}
);

module.exports =
mongoose.model(
    "Restock",
    restockSchema
);