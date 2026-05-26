const pool = require("../config/db");

const searchUsers = async (
    keyword
) => {
    const result = await pool.query(
        `
        SELECT
            id,
            first_name,
            last_name,
            username,
            email
        FROM users
        WHERE
            username ILIKE $1
            OR email ILIKE $1
            OR first_name ILIKE $1
            OR last_name ILIKE $1
        `,
        [`%${keyword}%`]
    );

    return result.rows;
};

module.exports = {
    searchUsers,
};