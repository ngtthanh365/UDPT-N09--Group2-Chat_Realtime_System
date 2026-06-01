require("dotenv").config();

const client = require(
    "../config/elasticsearch"
);

const seedUsers = async () => {
    try {
        await client.index({
            index: "users",
            document: {
                username: "hoang",
                email: "hoang@gmail.com",
                first_name: "Hoang",
                last_name: "Nguyen",
            },
        });

        await client.index({
            index: "users",
            document: {
                username: "thanh",
                email: "thanh@gmail.com",
                first_name: "Thanh",
                last_name: "Nguyen",
            },
        });
        await client.index({
            index: "users",
            document: {
                username: "tu",
                email: "tu@gmail.com",
                first_name: "Tu",
                last_name: "Dang",
            },
        });
        console.log(
            "✅ Users seeded"
        );
    } catch (error) {
        console.log(error);
    }
};

seedUsers();