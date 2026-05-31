const amqp = require("amqplib");
const Message = require("../models/Message");

let channel;

const connectRabbitMQConsumer = async () => {

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
                "✅ RabbitMQ Consumer Connected"
            );

            channel.consume(
                "chat_messages",
                async (message) => {

                    if (!message) return;

                    try {

                        const data =
                            JSON.parse(
                                message.content.toString()
                            );

                        console.log(
                            "📥 Message received:",
                            data
                        );

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
                            "✅ Message saved:",
                            newMessage._id
                        );

                        channel.ack(message);

                    } catch (error) {

                        console.log(
                            "❌ Consume Error:",
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
                    setTimeout(resolve, 3000)
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