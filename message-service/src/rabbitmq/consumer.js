const amqp = require("amqplib");
const Message = require("../models/Message");
const messageService = require("../services/messageService");

const {
    publishNotification
} = require("./producer");

const Conversation = require(
    "../models/Conversation"
);

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

            // xử lý từng message một
            channel.prefetch(1);

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
                            await messageService.sendMessage({
                                conversationId:
                                    data.conversationId,

                                senderId:
                                    data.senderId,

                                content:
                                    data.content,

                                type:
                                    data.type || "text",

                                mediaUrl:
                                    data.mediaUrl || null,

                                fileName:
                                    data.fileName || null,
                            });

                        console.log(
                            "✅ Message saved:",
                            newMessage._id
                        );

                        const conversation =
                            await Conversation.findById(
                                data.conversationId
                            );

                        if (conversation) {

                            const receiverId =
                                conversation.members.find(
                                    member =>
                                        member !== Number(
                                            data.senderId
                                        )
                                );

                            if (receiverId) {

                                await publishNotification({
                                    userId: receiverId,
                                    senderId: Number(
                                        data.senderId
                                    ),
                                    type: "message",
                                    content:
                                        "You received a new message",
                                    isRead: false,
                                    message: {
                                        _id: newMessage._id.toString(),
                                        conversationId: newMessage.conversationId,
                                        senderId: newMessage.senderId.toString(),
                                        content: newMessage.content,
                                        mediaUrl: newMessage.mediaUrl,
                                        createdAt: newMessage.createdAt,
                                        updatedAt: newMessage.updatedAt
                                    }
                                });
                            }

                        }

                    } catch (error) {

                        console.log(
                            "❌ Consume Error:",
                            error.message
                        );

                    } finally {

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