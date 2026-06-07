const messageService = require(
    "../services/messageService"
);

// CREATE CONVERSATION
const createConversation = async (
    req,
    res
) => {
    try {
        const {
            receiverId,
        } = req.body;

        const conversation =
            await messageService.createConversation(
                req.user.id,
                receiverId
            );

        res.status(201).json({
            message:
                "Conversation created",
            conversation,
        });
    } catch (error) {
        res.status(500).json({
            message:
                error.message,
        });
    }
};

// SEND MESSAGE
const sendMessage = async (
    req,
    res
) => {
    try {
        const {
            conversationId,
            content,
            type,
        } = req.body;

        const message =
            await messageService.sendMessage({
                conversationId,

                senderId:
                    req.user.id,

                content,

                type:
                    type || "text",

                mediaUrl:
                    req.file
                        ? req.file.path
                        : null,

                fileName:
                    req.file
                        ? req.file.originalname
                        : null,
            });

        res.status(201).json({
            message:
                "Message sent",

            data: message,
        });
    } catch (error) {
        res.status(500).json({
            message:
                error.message,
        });
    }
};

// GET MESSAGES
const getMessages = async (
    req,
    res
) => {
    try {
        const messages =
            await messageService.getMessages(
                req.params
                    .conversationId
            );

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message:
                error.message,
        });
    }
};

// GET CONVERSATIONS
const getConversations = async (

    req,
    res
) => {
    try {
        const userId = req.user.id;
        
        // Fetch conversations from service
        const conversations = await messageService.getConversations(userId);

        // Fetch user list from user-service
        const usersMap = {};
        try {
            const userResponse = await fetch("http://user-service:5002/api/users", {
                headers: {
                    Authorization: req.headers.authorization,
                },
            });
            if (userResponse.ok) {
                const usersList = await userResponse.json();
                usersList.forEach(u => {
                    usersMap[u.id] = {
                        _id: u.id.toString(),
                        displayName: `${u.first_name} ${u.last_name}`,
                        username: u.username,
                        email: u.email
                    };
                });
            } else {
                console.error("User-service returned status:", userResponse.status);
            }
        } catch (err) {
            console.error("Failed to fetch users from user-service:", err.message);
        }

        // Enrich conversations with participants and last message
        const enrichedConversations = [];
        for (const conv of conversations) {
            const participants = conv.members.map(memberId => {
                return usersMap[memberId] || {
                    _id: memberId.toString(),
                    displayName: `User ${memberId}`,
                    username: `user_${memberId}`
                };
            });

            // Fetch last message
            const lastMessage = await messageService.getLastMessage(conv._id.toString());

            let enrichedLastMessage = null;
            if (lastMessage) {
                const sender = usersMap[lastMessage.senderId] || {
                    _id: lastMessage.senderId.toString(),
                    displayName: `User ${lastMessage.senderId}`
                };
                enrichedLastMessage = {
                    _id: lastMessage._id,
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId,
                    sender
                };
            }

            enrichedConversations.push({
                _id: conv._id,
                members: conv.members,
                participants,
                lastMessage: enrichedLastMessage,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            });
        }

        res.json({
            conversations: enrichedConversations
        });
    } catch (error) {
        res.status(500).json({
            message:
                error.message,
        });
    }
};

module.exports = {
    createConversation,
    sendMessage,
    getMessages,
    getConversations,
};