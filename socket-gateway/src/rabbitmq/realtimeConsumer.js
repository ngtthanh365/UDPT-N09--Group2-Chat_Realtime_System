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

                console.log(
                    "✅ Realtime Notification Consumer Connected"
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
                                onlineUsers.get(
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