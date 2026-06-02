const amqp = require("amqplib");

const Notification = require(
    "../models/Notification"
);

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

                            channel.ack(
                                message
                            );

                        } catch (error) {

                            console.log(
                                "❌ Notification Consume Error:",
                                error.message
                            );

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