const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async () => {

    let retries = 20;

    while (retries > 0) {

        try {

            await pool.query("SELECT NOW()");

            console.log(
                "✅ Connected to PostgreSQL"
            );

            // Auto-create users and friendships tables if they don't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(150) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("✅ PostgreSQL table 'users' initialized");

            await pool.query(`
                CREATE TABLE IF NOT EXISTS friendships (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT unique_user_friend UNIQUE (user_id, friend_id)
                );
            `);
            console.log("✅ PostgreSQL table 'friendships' initialized");

            return true;

        } catch (error) {

            retries--;

            console.log(
                `⏳ PostgreSQL not ready... (${retries} retries left). Error: ${error.message}`
            );

            await new Promise(
                resolve =>
                    setTimeout(resolve, 3000)
            );

        }

    }

    throw new Error(
        "❌ PostgreSQL connection failed"
    );

};

module.exports = {
    pool,
    connectDB
};