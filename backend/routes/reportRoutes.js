const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    lowStockReport,

    outOfStockReport,

    salesReport,

    topProductsReport

} = require(
    "../controllers/reportController"
);


// Admin Only

router.get(
    "/low-stock",
    auth,
    authorize("admin"),
    lowStockReport
);

router.get(
    "/out-of-stock",
    auth,
    authorize("admin"),
    outOfStockReport
);

router.get(
    "/sales",
    auth,
    authorize("admin"),
    salesReport
);

router.get(
    "/top-products",
    auth,
    authorize("admin"),
    topProductsReport
);


module.exports =
router;