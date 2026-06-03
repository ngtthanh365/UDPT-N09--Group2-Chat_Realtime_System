const Notification = require(
    "../models/Notification"
);

// CREATE
const createNotification = async (
    data
) => {
    const notification =
        await Notification.create(data);

    return notification;
};

// GET USER NOTIFICATIONS
const getNotifications = async (
    userId
) => {
    return await Notification.find({
        userId,
    }).sort({
        createdAt: -1,
    });
};

// MARK AS READ
const markAsRead = async (id) => {
    return await Notification.findByIdAndUpdate(
        id,
        {
            isRead: true,
        },
        {
            new: true,
        }
    );
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
};