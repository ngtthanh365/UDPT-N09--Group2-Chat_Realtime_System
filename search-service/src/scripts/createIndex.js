require("dotenv").config();

const client = require(
    "../config/elasticsearch"
);

const createIndex = async () => {
    try {
        const exists =
            await client.indices.exists({
                index: "users",
            });

        if (!exists) {
            await client.indices.create({
                index: "users",
                body: {
                    mappings: {
                        properties: {
                            username: {
                                type: "text",
                            },
                            email: {
                                type: "text",
                            },
                            first_name: {
                                type: "text",
                            },
                            last_name: {
                                type: "text",
                            },
                        },
                    },
                },
            });

            console.log(
                "✅ Users index created"
            );
        } else {
            console.log(
                "⚡ Users index already exists"
            );
        }
    } catch (error) {
        console.log(error);
    }
};

createIndex();