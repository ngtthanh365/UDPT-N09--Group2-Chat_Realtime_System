const { io } = require("socket.io-client");

const socket =
    io("http://localhost:5006");

socket.on("connect", () => {

    console.log(
        "CONNECTED:",
        socket.id
    );

    socket.emit(
        "authenticate",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJob2FuZzEyMyIsImlhdCI6MTc4MDQ2MDYwMCwiZXhwIjoxNzgwNTQ3MDAwfQ.pZoDkhnt2-ZxlqVOGQfmpYYdBpCOYQDNBVT_nrVC1bA"
    );

    setTimeout(() => {

        socket.emit(
            "send_message",
            {
                conversationId:
                    "6a1fb3672733e01f9a420d9d",

                content:
                    "Hello realtime notification plzzz x3"
            }
        );

        console.log(
            "MESSAGE SENT"
        );

    }, 3000);

});