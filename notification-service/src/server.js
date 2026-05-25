require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const notificationRoutes = require(
    "./routes/notificationRoutes"
);

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use("/api", notificationRoutes);

const PORT =
    process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(
        `🚀 Notification Service running on port ${PORT}`
    );
});