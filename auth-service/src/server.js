const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { connectDB } = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(
                `🚀 Auth Service running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "❌ Failed to start Auth Service:",
            error.message
        );

        process.exit(1);

    }

};

startServer();