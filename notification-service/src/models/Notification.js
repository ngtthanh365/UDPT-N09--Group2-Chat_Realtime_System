const mongoose = require("mongoose");

const notificationSchema =
    new mongoose.Schema(
        {
            userId: {
                type: Number,
                required: true,
            },

            senderId: {
                type: Number,
                required: true,
            },

            type: {
                type: String,
                enum: [
                    "message",
                    "friend_request",
                ],
                default: "message",
            },

            content: {
                type: String,
                required: true,
            },

            isRead: {
                type: Boolean,
                default: false,
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);