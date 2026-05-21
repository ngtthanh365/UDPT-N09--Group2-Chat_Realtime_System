const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});