/**
 * Test: User A (gateway :5006) <-> User B (gateway :5008) qua Redis adapter
 *
 * Yêu cầu: redis, rabbitmq, message-service, 2 socket-gateway (5006 + 5008), auth-service
 *
 * Chạy:
 *   node dual-gateway-message-test.js
 */

const { io } = require("socket.io-client");

const GW_A = process.env.GW_A || "http://localhost:5006";
const GW_B = process.env.GW_B || "http://localhost:5008";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:5001/api/auth";
const MESSAGE_URL = process.env.MESSAGE_URL || "http://localhost:5003/api";
const TEST_TIMEOUT_MS = Number(process.env.TEST_TIMEOUT_MS || 20000);

const suffix = Date.now();

async function requestJson(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(`${res.status} ${url}: ${JSON.stringify(body)}`);
    }
    return body;
}

async function registerUser(label) {
    const username = `${label}_${suffix}`;
    const email = `${username}@test.local`;
    const password = "Test@12345";

    try {
        await requestJson(`${AUTH_URL}/register`, {
            method: "POST",
            body: JSON.stringify({
                first_name: "Gateway",
                last_name: "Test",
                username,
                email,
                password,
            }),
        });
    } catch {
        // user may already exist from a previous run with same suffix (unlikely)
    }

    const login = await requestJson(`${AUTH_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });

    return {
        username,
        token: login.token,
        userId: login.user.id,
    };
}

function connectGateway(url, token, label) {
    return new Promise((resolve, reject) => {
        const socket = io(url, {
            transports: ["websocket"],
            reconnection: false,
            timeout: 8000,
        });

        const timer = setTimeout(() => {
            socket.close();
            reject(new Error(`${label}: connect timeout (${url})`));
        }, 10000);

        socket.on("connect_error", (err) => {
            clearTimeout(timer);
            reject(new Error(`${label}: connect_error ${err.message}`));
        });

        socket.on("connect", () => {
            socket.emit("authenticate", token);
        });

        socket.on("error", (err) => {
            clearTimeout(timer);
            reject(new Error(`${label}: socket error ${err}`));
        });

        socket.once("online-users", () => {
            clearTimeout(timer);
            resolve(socket);
        });
    });
}

function waitForEvent(socket, event, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(event, onEvent);
            reject(new Error(`Timeout waiting for "${event}" (${timeoutMs}ms)`));
        }, timeoutMs);

        const onEvent = (payload) => {
            clearTimeout(timer);
            socket.off(event, onEvent);
            resolve(payload);
        };

        socket.on(event, onEvent);
    });
}

function joinConversation(socket, conversationId) {
    return new Promise((resolve) => {
        socket.emit("join_conversation", conversationId);
        setTimeout(resolve, 300);
    });
}

async function main() {
    console.log("=== Dual gateway message test ===");
    console.log(`Gateway A: ${GW_A}`);
    console.log(`Gateway B: ${GW_B}`);

    const userA = await registerUser("gw_user_a");
    const userB = await registerUser("gw_user_b");
    console.log(`User A id=${userA.userId} (${userA.username})`);
    console.log(`User B id=${userB.userId} (${userB.username})`);

    const convoRes = await requestJson(`${MESSAGE_URL}/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userA.token}` },
        body: JSON.stringify({ receiverId: userB.userId }),
    });

    const conversationId = convoRes.conversation._id;
    console.log(`Conversation: ${conversationId}`);

    const socketA = await connectGateway(GW_A, userA.token, "UserA@GW_A");
    const socketB = await connectGateway(GW_B, userB.token, "UserB@GW_B");
    console.log(`Connected A=${socketA.id} on ${GW_A}`);
    console.log(`Connected B=${socketB.id} on ${GW_B}`);

    await joinConversation(socketA, conversationId);
    await joinConversation(socketB, conversationId);

    // A (5006) -> B (5008)
    const bReceivePromise = waitForEvent(socketB, "receive_message", TEST_TIMEOUT_MS);
    socketA.emit("send_message", {
        conversationId,
        content: `Ping A->B @ ${new Date().toISOString()}`,
    });

    const msgB = await bReceivePromise;
    console.log("✅ B nhận từ A:", msgB.content);

    // B (5008) -> A (5006)
    const aReceivePromise = waitForEvent(socketA, "receive_message", TEST_TIMEOUT_MS);
    socketB.emit("send_message", {
        conversationId,
        content: `Pong B->A @ ${new Date().toISOString()}`,
    });

    const msgA = await aReceivePromise;
    console.log("✅ A nhận từ B:", msgA.content);

    socketA.close();
    socketB.close();

    console.log("\n🎉 PASS: Hai gateway khác cổng nhắn tin được với nhau (Redis adapter OK)");
}

main().catch((err) => {
    console.error("\n❌ FAIL:", err.message);
    process.exit(1);
});
