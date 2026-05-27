const mongoose = require(
    "mongoose"
);

const messageSchema =
    new mongoose.Schema(
        {
            conversationId: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Conversation",

                required: true,
            },

            senderId: {
                type: Number,
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

module.exports =
    mongoose.model(
        "Message",
        messageSchema
    );