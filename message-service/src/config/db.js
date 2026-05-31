const mongoose = require("mongoose");

const connectDB = async () => {

    let retries = 20;

    while (retries) {

        try {

            await mongoose.connect(
                process.env.MONGO_URI
            );

            console.log(
                "✅ MongoDB Connected"
            );

            return;

        } catch (error) {

            retries--;

            console.log(
                `⏳ MongoDB not ready... (${retries} retries left)`
            );

            await new Promise(
                resolve =>
                    setTimeout(resolve, 3000)
            );

        }

    }

    throw new Error(
        "MongoDB connection failed"
    );

};

module.exports = connectDB;