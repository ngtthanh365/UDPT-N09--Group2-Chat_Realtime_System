const express = require("express");

const router = express.Router();

const notificationController = require(
    "../controllers/notificationController"
);

const verifyToken = require(
    "../middlewares/authMiddleware"
);

router.post(
    "/notifications",
    verifyToken,
    notificationController.createNotification
);

router.get(
    "/notifications",
    verifyToken,
    notificationController.getNotifications
);

router.put(
    "/notifications/:id/read",
    verifyToken,
    notificationController.markAsRead
);

module.exports = router;