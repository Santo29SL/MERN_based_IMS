const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    getPackedOrders,
    shipOrder,
    deliverOrder

} = require(
    "../controllers/deliveryController"
);


// Delivery Partner Only

router.get(
    "/orders",
    auth,
    authorize("delivery"),
    getPackedOrders
);

router.put(
    "/orders/:id/shipped",
    auth,
    authorize("delivery"),
    shipOrder
);

router.put(
    "/orders/:id/delivered",
    auth,
    authorize("delivery"),
    deliverOrder
);

module.exports =
router;