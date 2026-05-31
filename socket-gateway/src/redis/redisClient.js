const { createClient } = require("redis");

const pubClient = createClient({
    url: "redis://redis:6379",
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