const express = require("express");

const router = express.Router();

const messageController = require(
    "../controllers/messageController"
);

const verifyToken = require(
    "../middlewares/authMiddleware"
);

const upload = require(
    "../middlewares/uploadMiddleware"
);

// CREATE CONVERSATION
router.post(
    "/conversations",
    verifyToken,
    messageController.createConversation
);

// GET CONVERSATIONS
router.get(
    "/conversations",
    verifyToken,
    messageController.getConversations
);


// SEND MESSAGE
router.post(
    "/messages",
    verifyToken,
    upload.single("media"),
    messageController.sendMessage
);

// GET MESSAGES
router.get(
    "/messages/:conversationId",
    verifyToken,
    messageController.getMessages
);

module.exports = router;