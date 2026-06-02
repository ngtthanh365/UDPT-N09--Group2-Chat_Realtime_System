const amqp = require("amqplib");

let channel;

const connectRabbitMQProducer =
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
                    "✅ Notification Producer Connected"
                );

                return;

            } catch (error) {

                retries--;

                console.log(
                    `⏳ RabbitMQ Producer not ready... (${retries} retries left)`
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
            "RabbitMQ Producer connection failed"
        );

    };

const publishNotification =
    async (data) => {

        if (!channel) {

            console.log(
                "❌ Notification Producer channel not found"
            );

            return;

        }

        channel.sendToQueue(
            "notification_queue",
            Buffer.from(
                JSON.stringify(data)
            ),
            {
                persistent: true,
            }
        );

        console.log(
            "📤 Notification published"
        );

    };

module.exports = {
    connectRabbitMQProducer,
    publishNotification,
};