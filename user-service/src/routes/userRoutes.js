const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const verifyToken = require("../middlewares/authMiddleware");

// GET ALL USERS
router.get("/users", verifyToken, userController.getUsers);

// SEARCH USERS
router.get(
    "/users/search",
    verifyToken,
    userController.searchUsers
);

// UPDATE PROFILE
router.put(
    "/users/profile",
    verifyToken,
    userController.updateProfile
);

// GET USER BY ID
router.get(
    "/users/:id",
    verifyToken,
    userController.getUser
);

module.exports = router;