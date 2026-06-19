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

    getAllOrders,

    deleteOrder,

    cancelOrder

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

router.put(
    "/:id/cancel",
    auth,
    authorize("customer"),
    cancelOrder
);


// ADMIN

router.get(
    "/",
    auth,
    authorize("admin"),
    getAllOrders
);

router.delete(
    "/:id",
    auth,
    authorize("admin"),
    deleteOrder
);

module.exports =
router;