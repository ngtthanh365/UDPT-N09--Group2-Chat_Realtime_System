const amqp = require("amqplib");

let channel;

const connectRealtimeProducer = async () => {

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
        "✅ Realtime Notification Producer Connected"
    );

};

const publishRealtimeNotification =
    async (data) => {

        if (!channel) return;

        channel.sendToQueue(
            "realtime_notification",
            Buffer.from(
                JSON.stringify(data)
            ),
            {
                persistent: true,
            }
        );

        console.log(
            "📤 Realtime notification published"
        );

    };

module.exports = {
    connectRealtimeProducer,
    publishRealtimeNotification,
};