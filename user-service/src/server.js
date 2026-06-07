const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const { connectRabbitMQProducer } = require("./rabbitmq/producer");

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    try {
        await connectRabbitMQProducer();
        
        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start User Service:", error.message);
        process.exit(1);
    }
};

startServer();