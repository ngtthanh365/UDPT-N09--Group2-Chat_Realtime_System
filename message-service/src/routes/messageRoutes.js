const express = require("express");

const router = express.Router();

const messageController = require("../controllers/messageController");

const verifyToken = require("../middlewares/authMiddleware");

// CREATE CONVERSATION
router.post(
    "/conversations",
    verifyToken,
    messageController.createConversation
);

// SEND MESSAGE
router.post(
    "/messages",
    verifyToken,
    messageController.sendMessage
);

// GET MESSAGES
router.get(
    "/messages/:conversationId",
    verifyToken,
    messageController.getMessages
);

module.exports = router;