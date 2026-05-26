const searchService = require(
    "../services/searchService"
);

const searchUsers = async (
    req,
    res
) => {
    try {
        const { keyword } = req.query;

        const users =
            await searchService.searchUsers(
                keyword
            );

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    searchUsers,
};