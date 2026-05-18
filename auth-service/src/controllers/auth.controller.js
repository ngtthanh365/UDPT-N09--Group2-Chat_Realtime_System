const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        // ❗ validate input
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ❗ check username
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // ❗ check email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword
        });

        res.json({
            message: "User registered",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // check input (NGUYÊN NHÂN lỗi của bạn ở đây 👇)
        if (!username || !password) {
            return res.status(400).json({ message: "Missing username or password" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login success",
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};