const authService = require("../services/authService");

// REGISTER
const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            message: "Register success",
            user,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const data = await authService.login(req.body);
        res.json({
            message: "Login success",
            ...data,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

module.exports = {
    register,
    login,
};