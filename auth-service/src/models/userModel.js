const { pool } = require("../config/db");

const findByUsername = async (username) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );
    return result.rows[0];
};

const findByUsernameOrEmail = async (username, email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE username=$1 OR email=$2",
        [username, email]
    );
    return result.rows;
};

const createUser = async (user) => {
    const { first_name, last_name, username, email, password } = user;

    const result = await pool.query(
        `INSERT INTO users(first_name, last_name, username, email, password)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [first_name, last_name, username, email, password]
    );

    return result.rows[0];
};

module.exports = {
    findByUsername,
    findByUsernameOrEmail,
    createUser,
};