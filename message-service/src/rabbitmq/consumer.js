const amqp = require("amqplib");

const Message = require("../models/Message");

let channel;

const connectRabbitMQConsumer = async () => {

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
            "✅ RabbitMQ Consumer Connected"
        );

        // =========================
        // CONSUME MESSAGE
        // =========================

        channel.consume(
            "chat_messages",
            async (message) => {

                if (message) {

                    const data =
                        JSON.parse(
                            message.content.toString()
                        );

                    console.log(
                        "📥 Message received from RabbitMQ:",
                        data
                    );

                    // SAVE TO MONGODB

                    const newMessage =
                        await Message.create({
                            conversationId:
                                data.conversationId,

                            senderId:
                                data.senderId,

                            content:
                                data.content,
                        });

                    console.log(
                        "✅ Message saved to MongoDB:",
                        newMessage._id
                    );

                    // ACK MESSAGE

                    channel.ack(message);

                }

            }
        );

    } catch (error) {

        console.log(
            "❌ RabbitMQ Consumer Error:",
            error.message
        );

    }

};

module.exports = {
    connectRabbitMQConsumer,
};