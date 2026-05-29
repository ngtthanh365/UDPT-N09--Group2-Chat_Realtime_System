const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
    try {

        const connection =
            await amqp.connect(
                "amqp://localhost"
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

    } catch (error) {

        console.log(
            "❌ RabbitMQ Producer Error:",
            error.message
        );

    }
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