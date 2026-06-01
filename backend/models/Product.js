const mongoose = require("mongoose");

const productSchema =
new mongoose.Schema(
{
    productName:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    category:{
        type:String
    },

    price:{
        type:Number,
        required:true
    },

    quantity:{
        type:Number,
        default:0
    },

    reorderLevel:{
        type:Number,
        default:10
    },

    warehouseLocation:{
        type:String
    }

},
{
    timestamps:true
}
);

module.exports =
mongoose.model(
    "Product",
    productSchema
);