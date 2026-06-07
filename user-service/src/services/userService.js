const userModel = require("../models/userModel");
const { publishNotification } = require("../rabbitmq/producer");

const getUsers = async () => {
    return await userModel.getAllUsers();
};

const getUser = async (id) => {
    return await userModel.getUserById(id);
};

const updateProfile = async (id, data) => {
    return await userModel.updateProfile(id, data);
};

const searchUsers = async (keyword) => {
    return await userModel.searchUsers(keyword);
};

// FRIENDSHIP SERVICES

const sendFriendRequest = async (userId, friendId, message) => {
    if (userId == friendId) {
        throw new Error("Không thể tự kết bạn với chính mình.");
    }

    const existing = await userModel.getFriendship(userId, friendId);
    if (existing) {
        throw new Error("Lời mời hoặc trạng thái bạn bè đã tồn tại.");
    }

    const request = await userModel.sendFriendRequest(userId, friendId);

    // Bắn sự kiện realtime
    const sender = await userModel.getUserById(userId);
    await publishNotification({
        userId: friendId, // Người nhận
        senderId: userId, // Người gửi
        type: "friend_request",
        content: message || `${sender.first_name} ${sender.last_name} đã gửi cho bạn một lời mời kết bạn.`
    });

    return request;
};

const getFriendRequests = async (userId) => {
    return await userModel.getFriendRequests(userId);
};

const acceptFriendRequest = async (userId, requestId) => {
    const request = await userModel.getFriendRequestById(requestId);
    if (!request) throw new Error("Lời mời không tồn tại.");
    if (request.friend_id != userId) throw new Error("Bạn không có quyền chấp nhận lời mời này.");

    const accepted = await userModel.acceptFriendRequest(requestId);

    // Bắn sự kiện thông báo cho người gửi (rằng họ đã được đồng ý)
    const receiver = await userModel.getUserById(userId);
    await publishNotification({
        userId: request.user_id, // Người gửi ban đầu (bây giờ là người nhận thông báo)
        senderId: userId,        // Người vừa chấp nhận
        type: "friend_request",
        content: `${receiver.first_name} ${receiver.last_name} đã chấp nhận lời mời kết bạn của bạn.`
    });

    return accepted;
};

const declineFriendRequest = async (userId, requestId) => {
    const request = await userModel.getFriendRequestById(requestId);
    if (!request) throw new Error("Lời mời không tồn tại.");
    if (request.friend_id != userId && request.user_id != userId) {
        throw new Error("Bạn không có quyền từ chối/hủy lời mời này.");
    }

    return await userModel.declineFriendRequest(requestId);
};

const getFriends = async (userId) => {
    return await userModel.getFriends(userId);
};

module.exports = {
    getUsers,
    getUser,
    updateProfile,
    searchUsers,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends
};