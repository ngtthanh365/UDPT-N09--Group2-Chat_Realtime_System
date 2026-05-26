const db = require("../config/db");

// GET ALL USERS
const getAllUsers = async () => {
    const result = await db.query(`
        SELECT id, first_name, last_name, username, email, created_at
        FROM users
        ORDER BY id ASC
    `);

    return result.rows;
};

// GET USER BY ID
const getUserById = async (id) => {
    const result = await db.query(
        `
        SELECT id, first_name, last_name, username, email, created_at
        FROM users
        WHERE id = $1
    `,
        [id]
    );

    return result.rows[0];
};

// UPDATE PROFILE
const updateProfile = async (id, data) => {
    const { first_name, last_name, email } = data;

    const result = await db.query(
        `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            email = $3
        WHERE id = $4
        RETURNING id, first_name, last_name, username, email
    `,
        [first_name, last_name, email, id]
    );

    return result.rows[0];
};

// SEARCH USERS
const searchUsers = async (keyword) => {
    const result = await db.query(
        `
        SELECT id, first_name, last_name, username, email
        FROM users
        WHERE username ILIKE $1
    `,
        [`%${keyword}%`]
    );

    return result.rows;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    searchUsers,
};