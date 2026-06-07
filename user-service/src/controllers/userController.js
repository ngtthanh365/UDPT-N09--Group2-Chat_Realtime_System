const userService = require("../services/userService");

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// GET USER BY ID
const getUser = async (req, res) => {
    try {
        const user = await userService.getUser(req.params.id);

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateProfile(
            req.user.id,
            req.body
        );

        res.json({
            message: "Profile updated",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// SEARCH USERS
const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q;

        const users = await userService.searchUsers(keyword);

        res.json({ data: users }); // Đóng gói vào data để tương thích với Frontend
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// FRIENDSHIP CONTROLLERS

const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { to, message } = req.body; // 'to' là friendId

        const request = await userService.sendFriendRequest(userId, to, message);
        res.status(201).json({ message: "Đã gửi lời mời kết bạn", request });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await userService.getFriendRequests(userId);
        res.json(requests); // trả về { sent, received }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = req.params.id;

        const accepted = await userService.acceptFriendRequest(userId, requestId);
        res.json({ message: "Đã chấp nhận lời mời", request: accepted });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const declineFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = req.params.id;

        await userService.declineFriendRequest(userId, requestId);
        res.json({ message: "Đã từ chối/hủy lời mời" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;
        const friends = await userService.getFriends(userId);
        res.json({ friends });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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