const { createClient } = require("redis");

const pubClient = createClient({
    url: "redis://localhost:6379",
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
    console.log("Redis Pub Error:", err);
});

subClient.on("error", (err) => {
    console.log("Redis Sub Error:", err);
});

async function connectRedis() {
    await pubClient.connect();
    await subClient.connect();

    console.log("Redis connected");
}

module.exports = {
    pubClient,
    subClient,
    connectRedis,
};