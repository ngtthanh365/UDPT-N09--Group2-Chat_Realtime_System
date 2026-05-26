const jwt = require("jsonwebtoken");

const verifySocketToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = verifySocketToken;