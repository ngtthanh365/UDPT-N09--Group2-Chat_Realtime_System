const { io } = require("socket.io-client");

const socket = io("http://localhost:5006");

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    // giả lập user online
    socket.emit(
        "authenticate",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ0aGFuaDEyMyIsImlhdCI6MTc4MDQ2MjIzNywiZXhwIjoxNzgwNTQ4NjM3fQ.24dF2lbUK261nS_zrMsF6JGXSrEatJQ-pj2wla0eepc"
    );
});

socket.on(
    "new_notification",
    (data) => {
        console.log(
            "🔔 NEW NOTIFICATION:",
            data
        );
    }
);

socket.on(
    "online_users",
    (users) => {
        console.log(
            "👥 Online Users:",
            users
        );
    }
);