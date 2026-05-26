const userModel = require("../models/userModel");

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

module.exports = {
    getUsers,
    getUser,
    updateProfile,
    searchUsers,
};