const express = require(
    "express"
);

const router = express.Router();

const {
    searchUsers,
} = require(
    "../controllers/searchController"
);

const verifyToken = require(
    "../middlewares/authMiddleware"
);

router.get(
    "/users",
    verifyToken,
    searchUsers
);

module.exports = router;