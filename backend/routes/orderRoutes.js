const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    placeOrder,

    getMyOrders,

    getAllOrders

}
=
require("../controllers/orderController");


// CUSTOMER

router.post(
    "/",
    auth,
    authorize("customer"),
    placeOrder
);

router.get(
    "/myorders",
    auth,
    authorize("customer"),
    getMyOrders
);


// ADMIN

router.get(
    "/",
    auth,
    authorize("admin"),
    getAllOrders
);

module.exports =
router;