const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
        },

        senderId: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "file",
            ],
            default: "text",
        },

        content: {
            type: String,
        },

        mediaUrl: {
            type: String,
        },

        fileName: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Message",
    messageSchema
);