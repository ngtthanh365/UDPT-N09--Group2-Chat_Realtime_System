const jwt = require("jsonwebtoken");

const BASE_URL = "http://localhost/api";
const JWT_SECRET = "chat_app_secret_auth";

// Tạo token thủ công cho Admin (ID: 1) và NguyenThanh (ID: 2)
const tokenAdmin = jwt.sign({ id: 1, username: "admin" }, JWT_SECRET, { expiresIn: "1d" });
const tokenNguyenThanh = jwt.sign({ id: 2, username: "nguyenthanh" }, JWT_SECRET, { expiresIn: "1d" });

async function request(endpoint, method = "GET", data = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const json = await response.json();
    return { status: response.status, data: json };
}

async function runTest() {
    console.log("=== BẮT ĐẦU TEST KẾT BẠN (Admin & NguyenThanh) ===\n");

    try {
        // 1. Admin tìm kiếm NguyenThanh
        console.log("🔎 1. Admin tìm kiếm 'nguyenthanh'...");
        const searchRes = await request(`/search/users?keyword=nguyenthanh`, "GET", null, tokenAdmin);
        console.log("Response:", searchRes);
        if (searchRes.data.data) {
            console.log("Kết quả tìm kiếm:", searchRes.data.data.map(u => u.username));
        }

        // 2. Admin gửi lời mời cho NguyenThanh
        console.log("\n📨 2. Admin (ID: 1) gửi lời mời cho NguyenThanh (ID: 2)...");
        const sendReq = await request("/users/friends/requests", "POST", { to: 2, message: "Chào NguyenThanh, mình là Admin" }, tokenAdmin);
        console.log("Kết quả gửi:", sendReq.data.message || sendReq.data);

        // 3. NguyenThanh lấy danh sách lời mời nhận được
        console.log("\n📩 3. NguyenThanh lấy danh sách lời mời...");
        const reqList = await request("/users/friends/requests", "GET", null, tokenNguyenThanh);
        const received = reqList.data.received || [];
        console.log("Lời mời nhận được:", received.length, "lời mời. Người gửi:", received.map(r => r.username));

        if (received.length > 0) {
            const reqId = received[0].id;
            
            // 4. NguyenThanh chấp nhận lời mời
            console.log(`\n🤝 4. NguyenThanh chấp nhận lời mời (ID: ${reqId})...`);
            const acceptReq = await request(`/users/friends/requests/${reqId}/accept`, "POST", null, tokenNguyenThanh);
            console.log("Kết quả chấp nhận:", acceptReq.data.message);
        }

        // 5. Admin lấy danh sách bạn bè
        console.log("\n👥 5. Admin kiểm tra danh sách bạn bè...");
        const friendsA = await request("/users/friends", "GET", null, tokenAdmin);
        console.log("Bạn của Admin:", friendsA.data.friends.map(f => f.username));

        // 6. NguyenThanh lấy danh sách bạn bè
        console.log("\n👥 6. NguyenThanh kiểm tra danh sách bạn bè...");
        const friendsB = await request("/users/friends", "GET", null, tokenNguyenThanh);
        console.log("Bạn của NguyenThanh:", friendsB.data.friends.map(f => f.username));

    } catch (error) {
        console.error("Lỗi:", error);
    }
    
    console.log("\n=== HOÀN TẤT TEST ===");
}

runTest();
