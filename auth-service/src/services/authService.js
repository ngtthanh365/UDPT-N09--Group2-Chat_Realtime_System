const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (data) => {
    const { first_name, last_name, username, email, password } = data;

    const existingUser = await userModel.findByUsernameOrEmail(
        username,
        email
    );

    if (existingUser.length > 0) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
    });

    return newUser;
};

// LOGIN
const login = async (data) => {
    const { username, password } = data;

    const user = await userModel.findByUsername(username);

    if (!user) {
        throw new Error("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid username or password");
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
        },
    };
};

module.exports = {
    register,
    login,
};