const Conversation = require(
    "../models/Conversation"
);

const Message = require(
    "../models/Message"
);

// CREATE CONVERSATION
const createConversation = async (
    senderId,
    receiverId
) => {
    const conversation =
        await Conversation.create({
            members: [
                senderId,
                receiverId,
            ],
        });

    return conversation;
};

// SEND MESSAGE
const sendMessage = async (
    data
) => {
    const message =
        await Message.create(data);

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

module.exports = {
    createConversation,
    sendMessage,
    getMessages,
};