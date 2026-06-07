const { pubClient } = require("../redis/redisClient");

const onlineUsers = {
    set: async (userId, socketId) => {
        await pubClient.hSet("online_users", userId.toString(), socketId);
    },
    get: async (userId) => {
        return await pubClient.hGet("online_users", userId.toString());
    },
    delete: async (userId) => {
        await pubClient.hDel("online_users", userId.toString());
    },
    keys: async () => {
        return await pubClient.hKeys("online_users");
    }
};

module.exports = onlineUsers;