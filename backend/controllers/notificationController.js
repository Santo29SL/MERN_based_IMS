const Notification =
require("../models/Notification");


// GET ALL NOTIFICATIONS

const getNotifications =
async (req,res) => {

    try {

        const notifications =
        await Notification.find()
        .sort({
            createdAt: -1
        });

        res.json(
            notifications
        );

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};


// MARK AS READ

const markAsRead =
async (req,res) => {

    try {

        const notification =
        await Notification.findById(
            req.params.id
        );

        if(!notification){

            return res.status(404)
            .json({
                message:
                "Notification Not Found"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.json({
            message:
            "Notification Read"
        });

    } catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};


module.exports = {

    getNotifications,

    markAsRead
};