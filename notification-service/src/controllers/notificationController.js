const notificationService = require(
    "../services/notificationService"
);

// CREATE
const createNotification =
    async (req, res) => {
        try {
            const notification =
                await notificationService.createNotification(
                    req.body
                );

            res.status(201).json({
                message:
                    "Notification created",
                notification,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };

// GET
const getNotifications =
    async (req, res) => {
        try {
            const notifications =
                await notificationService.getNotifications(
                    req.user.id
                );

            res.json(notifications);
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };

// MARK READ
const markAsRead =
    async (req, res) => {
        try {
            const notification =
                await notificationService.markAsRead(
                    req.params.id
                );

            res.json({
                message:
                    "Notification updated",
                notification,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
};