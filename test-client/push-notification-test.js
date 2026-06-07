const amqp = require("amqplib");

async function pushTestNotification() {
    try {
        // Kết nối tới RabbitMQ (cổng mặc định 5672 như trong docker-compose)
        const connection = await amqp.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();

        const queue = "realtime_notification";
        await channel.assertQueue(queue, { durable: true });

        // User ID 3 tương ứng với mock token của 'thanh123' trong socket-test.js
        const payload = {
            userId: 3, 
            senderId: 99,
            type: "system",
            content: "Hello from direct RabbitMQ push!",
            isRead: false
        };

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
        console.log("📤 Fake notification pushed to RabbitMQ for userId 3:", payload);

        // Đợi một chút rồi đóng kết nối
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (err) {
        console.error("❌ Error pushing to RabbitMQ:", err.message);
    }
}

pushTestNotification();
