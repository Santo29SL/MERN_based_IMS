const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    adminDashboard,

    customerDashboard,

    warehouseDashboard,

    deliveryDashboard

} = require(
    "../controllers/dashboardController"
);


// Admin

router.get(
    "/admin",
    auth,
    authorize("admin"),
    adminDashboard
);


// Customer

router.get(
    "/customer",
    auth,
    authorize("customer"),
    customerDashboard
);


// Warehouse

router.get(
    "/warehouse",
    auth,
    authorize("warehouse"),
    warehouseDashboard
);


// Delivery

router.get(
    "/delivery",
    auth,
    authorize("delivery"),
    deliveryDashboard
);


module.exports =
router;