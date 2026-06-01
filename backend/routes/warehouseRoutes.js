const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    getRestocks,

    completeRestock,

    getOrders,

    packOrder

}
=
require(
    "../controllers/warehouseController"
);


// RESTOCK REQUESTS

router.get(
    "/restocks",
    auth,
    authorize("warehouse"),
    getRestocks
);

router.put(
    "/restocks/:id",
    auth,
    authorize("warehouse"),
    completeRestock
);


// ORDERS

router.get(
    "/orders",
    auth,
    authorize("warehouse"),
    getOrders
);

router.put(
    "/orders/:id/packed",
    auth,
    authorize("warehouse"),
    packOrder
);

module.exports =
router;