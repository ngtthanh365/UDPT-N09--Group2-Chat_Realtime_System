const client = require(
    "../config/elasticsearch"
);

const searchUsers = async (
    keyword
) => {
    const result =
        await client.search({
            index: "users",
            query: {
                bool: {
                    should: [
                        {
                            wildcard: {
                                username: `*${keyword}*`,
                            },
                        },
                        {
                            wildcard: {
                                first_name: `*${keyword}*`,
                            },
                        },
                        {
                            wildcard: {
                                last_name: `*${keyword}*`,
                            },
                        },
                    ],
                },
            },
        });

    return result.hits.hits.map(
        (item) => ({
            id: item._id,
            ...item._source,
        })
    );
};

module.exports = {
    searchUsers,
};