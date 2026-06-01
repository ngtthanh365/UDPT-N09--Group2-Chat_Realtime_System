require("dotenv").config();

const pool = require(
    "../config/db"
);

const elasticClient = require(
    "../config/elasticsearch"
);

const syncUsers = async () => {
    try {
        const users = await pool.query(
            "SELECT * FROM users"
        );

        for (const user of users.rows) {
            await elasticClient.index({
                index: "users",
                document: {
                    username:
                        user.username,
                    email: user.email,
                    first_name:
                        user.first_name,
                    last_name:
                        user.last_name,
                },
            });
        }

        console.log(
            "✅ Users synced to Elasticsearch"
        );
    } catch (error) {
        console.log(error);
    }
};

syncUsers();