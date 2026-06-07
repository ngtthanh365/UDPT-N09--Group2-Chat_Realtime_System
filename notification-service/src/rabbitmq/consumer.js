const amqp = require("amqplib");

const Notification = require(
    "../models/Notification"
);

const {
    publishRealtimeNotification
} = require("./realtimeProducer");

let channel;

const connectRabbitMQConsumer =
    async () => {

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
                    "notification_queue",
                    {
                        durable: true,
                    }
                );

                console.log(
                    "✅ Notification RabbitMQ Connected"
                );

                channel.consume(
                    "notification_queue",

                    async (message) => {

                        if (!message) return;

                        try {

                            const data =
                                JSON.parse(
                                    message.content.toString()
                                );

                            console.log(
                                "📥 Notification received:",
                                data
                            );

                            const notification =
                                await Notification.create(
                                    data
                                );

                            console.log(
                                "✅ Notification saved:",
                                notification._id
                            );

                            // Publish to realtime queue
                            await publishRealtimeNotification({
                                userId: data.userId,
                                senderId: data.senderId,
                                type: data.type,
                                content: data.content,
                                isRead: data.isRead,
                                message: data.message
                            });

                            channel.ack(
                                message
                            );

                        } catch (error) {

                            console.log(
                                "❌ Notification Consume Error:",
                                error.message
                            );
                            channel.ack(message);
                        }

                    }
                );

                return;

            } catch (error) {

                retries--;

                console.log(
                    `⏳ RabbitMQ not ready... (${retries} retries left)`
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

        throw new Error(
            "RabbitMQ connection failed"
        );

    };

module.exports = {
    connectRabbitMQConsumer,
};