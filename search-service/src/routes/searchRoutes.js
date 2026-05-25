const express = require("express");

const router = express.Router();

const searchController = require(
    "../controllers/searchController"
);

const verifyToken = require(
    "../middlewares/authMiddleware"
);

router.get(
    "/search/users",
    verifyToken,
    searchController.searchUsers
);

module.exports = router;