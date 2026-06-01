const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const {

    getNotifications,

    markAsRead

} =
require(
    "../controllers/notificationController"
);


router.get(
    "/",
    auth,
    authorize(
        "admin",
        "warehouse"
    ),
    getNotifications
);

router.put(
    "/:id/read",
    auth,
    authorize(
        "admin",
        "warehouse"
    ),
    markAsRead
);

module.exports =
router;