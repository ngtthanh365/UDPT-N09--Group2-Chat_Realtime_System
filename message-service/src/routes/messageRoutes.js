const express = require("express");

const router = express.Router();

const messageController = require("../controllers/messageController");

const verifyToken = require("../middlewares/authMiddleware");

// CREATE CONVERSATION
router.post(
    "/conversations",
    messageController.createConversation
);

// SEND MESSAGE
router.post(
    "/messages",
    messageController.sendMessage
);

// GET MESSAGES
router.get(
    "/messages/:conversationId",
    verifyToken,
    messageController.getMessages
);

module.exports = router;