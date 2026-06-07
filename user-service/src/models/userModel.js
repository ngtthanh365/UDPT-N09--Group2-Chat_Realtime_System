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

// FRIENDSHIP QUERIES

const getFriendship = async (userId, friendId) => {
    const result = await db.query(
        `SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId]
    );
    return result.rows[0];
};

const sendFriendRequest = async (userId, friendId) => {
    const result = await db.query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
        [userId, friendId]
    );
    return result.rows[0];
};

const getFriendRequests = async (userId) => {
    // Lấy danh sách gửi đi (sent)
    const sentResult = await db.query(
        `SELECT f.id, f.created_at, u.id as "userId", u.first_name, u.last_name, u.username 
         FROM friendships f
         JOIN users u ON f.friend_id = u.id
         WHERE f.user_id = $1 AND f.status = 'pending'`,
        [userId]
    );

    // Lấy danh sách nhận được (received)
    const receivedResult = await db.query(
        `SELECT f.id, f.created_at, u.id as "userId", u.first_name, u.last_name, u.username 
         FROM friendships f
         JOIN users u ON f.user_id = u.id
         WHERE f.friend_id = $1 AND f.status = 'pending'`,
        [userId]
    );

    return {
        sent: sentResult.rows,
        received: receivedResult.rows
    };
};

const getFriendRequestById = async (requestId) => {
    const result = await db.query(`SELECT * FROM friendships WHERE id = $1`, [requestId]);
    return result.rows[0];
};

const acceptFriendRequest = async (requestId) => {
    const result = await db.query(
        `UPDATE friendships SET status = 'accepted' WHERE id = $1 RETURNING *`,
        [requestId]
    );
    return result.rows[0];
};

const declineFriendRequest = async (requestId) => {
    const result = await db.query(
        `DELETE FROM friendships WHERE id = $1 RETURNING *`,
        [requestId]
    );
    return result.rows[0];
};

const getFriends = async (userId) => {
    const result = await db.query(
        `SELECT u.id as "userId", u.first_name, u.last_name, u.username
         FROM friendships f
         JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
         WHERE (f.user_id = $1 OR f.friend_id = $1) 
         AND u.id != $1 AND f.status = 'accepted'`,
        [userId]
    );
    return result.rows;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    searchUsers,
    getFriendship,
    sendFriendRequest,
    getFriendRequests,
    getFriendRequestById,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends
};