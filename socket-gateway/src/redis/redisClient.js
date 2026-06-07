const { createClient } = require("redis");

const redisUrl =
    process.env.REDIS_URL || "redis://localhost:6379";

const pubClient = createClient({
    url: redisUrl,
});

const subClient = pubClient.duplicate();

const connectRedis = async () => {
    try {

        await pubClient.connect();

        await subClient.connect();

        console.log(
            "✅ Redis Connected"
        );

    } catch (error) {

        console.log(
            "❌ Redis Connection Error:",
            error
        );

        process.exit(1);
    }
};

module.exports = {
    pubClient,
    subClient,
    connectRedis,
};