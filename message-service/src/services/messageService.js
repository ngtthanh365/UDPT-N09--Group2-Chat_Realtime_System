const Conversation = require(
    "../models/Conversation"
);

const Message = require(
    "../models/Message"
);

const { publishRealtimeMessage } = require("../rabbitmq/producer");

// CREATE CONVERSATION
const createConversation = async (
    senderId,
    receiverId
) => {
    const sId = Number(senderId);
    const rId = Number(receiverId);

    // Check if conversation already exists (direct chat)
    const existing = await Conversation.findOne({
        members: { $all: [sId, rId] },
        $expr: { $eq: [{ $size: "$members" }, 2] }
    });

    if (existing) {
        return existing;
    }

    const conversation =
        await Conversation.create({
            members: [sId, rId],
        });

    return conversation;
};

// SEND MESSAGE
const sendMessage = async (
    data
) => {
    const message =
        await Message.create(data);

    try {
        await publishRealtimeMessage({
            message: {
                _id: message._id.toString(),
                conversationId: message.conversationId,
                senderId: message.senderId.toString(),
                content: message.content,
                mediaUrl: message.mediaUrl,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt
            }
        });
    } catch (err) {
        console.error("❌ Failed to publish realtime message:", err.message);
    }

    return message;
};

// GET MESSAGES
const getMessages = async (
    conversationId
) => {
    return await Message.find({
        conversationId,
    }).sort({
        createdAt: 1,
    });
};

// GET CONVERSATIONS
const getConversations = async (userId) => {
    const id = Number(userId);
    return await Conversation.find({
        members: { $in: [id] }
    }).sort({
        updatedAt: -1,
    });
};

// GET LAST MESSAGE
const getLastMessage = async (conversationId) => {
    return await Message.findOne({
        conversationId,
    }).sort({
        createdAt: -1,
    });
};

module.exports = {
    createConversation,
    sendMessage,
    getMessages,
    getConversations,
    getLastMessage,
};

