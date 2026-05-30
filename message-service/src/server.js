const express = require(
    "express"
);

const cors = require(
    "cors"
);

require("dotenv").config();

const connectDB = require(
    "./config/db"
);

const messageRoutes = require(
    "./routes/messageRoutes"
);

const app = express();

// CONNECT DATABASE
connectDB();

app.use(cors());

app.use(express.json());

// ROUTES
app.use(
    "/api/messages",
    messageRoutes
);

const PORT =
    process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(
        `🚀 Message Service running on port ${PORT}`
    );
});