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

    markAsRead,

    createNotification

} =
require(
    "../controllers/notificationController"
);


router.get(
    "/",
    auth,
    authorize(
        "admin",
        "warehouse",
        "delivery"
    ),
    getNotifications
);

router.post(
    "/",
    auth,
    authorize("admin"),
    createNotification
);

router.put(
    "/:id/read",
    auth,
    authorize(
        "admin",
        "warehouse",
        "delivery"
    ),
    markAsRead
);

module.exports =
router;