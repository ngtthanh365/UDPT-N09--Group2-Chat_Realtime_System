const verifySocketToken = require(
    "../middlewares/authMiddleware"
);

const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(
            "✅ User connected:",
            socket.id
        );

        // =========================
        // AUTHENTICATE USER
        // =========================

        socket.on("authenticate", (token) => {
            const user = verifySocketToken(token);

            if (!user) {
                socket.emit("error", "Invalid token");
                return;
            }

            socket.user = user;

            onlineUsers.set(
                user.id,
                socket.id
            );

            console.log(
                `🔥 User ${user.username} authenticated`
            );

            io.emit(
                "online_users",
                Array.from(onlineUsers.keys())
            );
        });

        // =========================
        // JOIN ROOM
        // =========================

        socket.on(
            "join_conversation",
            (conversationId) => {
                socket.join(conversationId);

                console.log(
                    `User joined room: ${conversationId}`
                );
            }
        );

        // =========================
        // SEND MESSAGE
        // =========================

        socket.on(
            "send_message",
            (data) => {
                const {
                    conversationId,
                    senderId,
                    content,
                } = data;

                io.to(conversationId).emit(
                    "receive_message",
                    {
                        senderId,
                        content,
                        createdAt:
                            new Date(),
                    }
                );
            }
        );

        // =========================
        // TYPING
        // =========================

        socket.on(
            "typing",
            (conversationId) => {
                socket
                    .to(conversationId)
                    .emit("typing");
            }
        );

        // =========================
        // STOP TYPING
        // =========================

        socket.on(
            "stop_typing",
            (conversationId) => {
                socket
                    .to(conversationId)
                    .emit(
                        "stop_typing"
                    );
            }
        );

        // =========================
        // DISCONNECT
        // =========================

        socket.on("disconnect", () => {
            console.log(
                "❌ User disconnected:",
                socket.id
            );

            if (
                socket.user &&
                socket.user.id
            ) {
                onlineUsers.delete(
                    socket.user.id
                );

                io.emit(
                    "online_users",
                    Array.from(
                        onlineUsers.keys()
                    )
                );
            }
        });
    });
};

module.exports = socketHandler;