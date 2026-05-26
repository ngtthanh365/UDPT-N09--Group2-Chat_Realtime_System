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

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateProfile,
    searchUsers,
};