const amqp = require("amqplib");

const onlineUsers =
    require("../socket/onlineUsers");

let channel;

const connectRealtimeConsumer =
    async (io) => {

        let retries = 20;

        while (retries) {

            try {

                const connection =
                    await amqp.connect(
                        process.env.RABBITMQ_URL
                    );

                channel =
                    await connection.createChannel();

                await channel.assertQueue(
                    "realtime_notification",
                    {
                        durable: true,
                    }
                );

                await channel.assertQueue(
                    "realtime_messages",
                    {
                        durable: true,
                    }
                );

                console.log(
                    "✅ Realtime Notification & Messages Consumer Connected"
                );

                // Consume realtime_messages
                channel.consume(
                    "realtime_messages",
                    async (message) => {
                        if (!message) return;
                        try {
                            const data = JSON.parse(message.content.toString());
                            console.log("📥 Realtime Message:", data);

                            io.to(data.message.conversationId).emit(
                                "receive_message",
                                data.message
                            );

                            channel.ack(message);
                        } catch (error) {
                            console.log("❌ Realtime Message Error:", error.message);
                            channel.ack(message);
                        }
                    }
                );

                channel.consume(
                    "realtime_notification",

                    async (message) => {

                        if (!message) return;

                        try {

                            const data =
                                JSON.parse(
                                    message.content.toString()
                                );

                            console.log(
                                "📥 Realtime Notification:",
                                data
                            );

                            const socketId =
                                await onlineUsers.get(
                                    data.userId
                                );

                            if (socketId) {

                                io.to(socketId).emit(
                                    "new_notification",
                                    data
                                );

                                console.log(
                                    `🔔 Notification sent to user ${data.userId}`
                                );

                            }

                            channel.ack(
                                message
                            );

                        } catch (error) {

                            console.log(
                                "❌ Realtime Notification Error:",
                                error.message
                            );

                            channel.ack(
                                message
                            );

                        }

                    }
                );

                return;

            } catch (error) {

                retries--;

                console.log(
                    `⏳ Realtime Consumer retry (${retries})`
                );

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            3000
                        )
                );

            }

        }

    };

module.exports = {
    connectRealtimeConsumer,
};