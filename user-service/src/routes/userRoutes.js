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

// --- FRIENDSHIP ROUTES ---

// GET FRIEND LIST
router.get(
    "/users/friends",
    verifyToken,
    userController.getFriends
);

// SEND FRIEND REQUEST
router.post(
    "/users/friends/requests",
    verifyToken,
    userController.sendFriendRequest
);

// GET FRIEND REQUESTS
router.get(
    "/users/friends/requests",
    verifyToken,
    userController.getFriendRequests
);

// ACCEPT FRIEND REQUEST
router.post(
    "/users/friends/requests/:id/accept",
    verifyToken,
    userController.acceptFriendRequest
);

// DECLINE FRIEND REQUEST
router.post(
    "/users/friends/requests/:id/decline",
    verifyToken,
    userController.declineFriendRequest
);

// GET USER BY ID (MUST BE AT THE END)
router.get(
    "/users/:id",
    verifyToken,
    userController.getUser
);

module.exports = router;