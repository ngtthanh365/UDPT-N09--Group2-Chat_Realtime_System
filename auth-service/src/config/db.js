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

            return true;

        } catch (error) {

            retries--;

            console.log(
                `⏳ PostgreSQL not ready... (${retries} retries left)`
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