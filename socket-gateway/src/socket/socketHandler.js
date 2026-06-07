const {
    publishMessage
} = require("../rabbitmq/producer");

const verifySocketToken = require(
    "../middlewares/authMiddleware"
);

const onlineUsers =
    require("./onlineUsers");

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(
            `[Gateway ${process.env.PORT}] ✅ User connected:`,
            socket.id
        );

        // =========================
        // AUTHENTICATE USER
        // =========================

        socket.on("authenticate", async (token) => {
            const user = verifySocketToken(token);

            if (!user) {
                console.log("❌ TOKEN INVALID");

                socket.emit(
                    "error",
                    "Invalid token"
                );

                return;
            }

            socket.user = user;

            await onlineUsers.set(
                user.id,
                socket.id
            );

            console.log(
                `🔥 User ${user.username} authenticated`
            );

            io.emit(
                "online-users",
                await onlineUsers.keys()
            );

        }
        );

        // =========================
        // JOIN ROOM
        // =========================

        socket.on(
            "join_conversation",
            (conversationId) => {

                socket.join(
                    conversationId
                );

                console.log(
                    `User joined room: ${conversationId}`
                );

            }
        );

        socket.on(
            "join-conversation",
            (conversationId) => {

                socket.join(
                    conversationId
                );

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
            async (data) => {

                try {

                    console.log(
                        `[Gateway ${process.env.PORT}] 📨 Message received:`,
                        data
                    );

                    const {
                        conversationId,
                        content,
                    } = data;

                    // =========================
                    // REQUIRE AUTH
                    // =========================

                    if (!socket.user) {

                        socket.emit(
                            "error",
                            "Unauthorized"
                        );

                        return;
                    }

                    const senderId =
                        socket.user.id;

                    // =========================
                    // SAVE MESSAGE
                    // =========================

                    await publishMessage({
                        conversationId,
                        senderId,
                        content,
                    });

                } catch (error) {

                    console.log(
                        "❌ Send Message Error:",
                        error.message
                    );

                }

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
                    .emit("stop_typing");

            }
        );

        // =========================
        // DISCONNECT
        // =========================

        socket.on(
            "disconnect",
            async () => {

                console.log(
                    `[Gateway ${process.env.PORT}] ❌ User disconnected:`,
                    socket.id
                );

                if (
                    socket.user &&
                    socket.user.id
                ) {

                    await onlineUsers.delete(
                        socket.user.id
                    );

                    io.emit(
                        "online-users",
                        await onlineUsers.keys()
                    );

                }

            }
        );

    });

};

module.exports = socketHandler;