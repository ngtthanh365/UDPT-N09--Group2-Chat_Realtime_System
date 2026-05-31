const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {

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
                "chat_messages",
                {
                    durable: true,
                }
            );

            console.log(
                "✅ RabbitMQ Producer Connected"
            );

            return;

        } catch (error) {

            retries--;

            console.log(
                `⏳ RabbitMQ not ready... (${retries} retries left)`
            );

            await new Promise(
                resolve =>
                    setTimeout(resolve, 3000)
            );

        }

    }

    throw new Error(
        "RabbitMQ connection failed"
    );

};

const publishMessage = async (messageData) => {

    if (!channel) {

        console.log(
            "❌ RabbitMQ channel not found"
        );

        return;

    }

    channel.sendToQueue(
        "chat_messages",
        Buffer.from(
            JSON.stringify(messageData)
        )
    );

    console.log(
        "📤 Message published to RabbitMQ"
    );

};

module.exports = {
    connectRabbitMQ,
    publishMessage,
};