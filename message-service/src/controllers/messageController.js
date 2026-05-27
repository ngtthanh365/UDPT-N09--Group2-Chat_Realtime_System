const messageService = require("../services/messageService");

// CREATE CONVERSATION
const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;

        const conversation =
            await messageService.createConversation(
                req.user.id,
                receiverId
            );

        res.status(201).json({
            message: "Conversation created",
            conversation,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// SEND MESSAGE
const sendMessage = async (req, res) => {
    try {
        const {
            conversationId,
            senderId,
            content,
        } = req.body;

        const message =
            await messageService.sendMessage(
                conversationId,
                senderId,
                content
            );

        res.status(201).json({
            message: "Message sent",
            data: message,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// GET MESSAGES
const getMessages = async (req, res) => {
    try {
        const messages =
            await messageService.getMessages(
                req.params.conversationId
            );

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createConversation,
    sendMessage,
    getMessages,
};