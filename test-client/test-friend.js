const BASE_URL = "http://localhost/api";

async function request(endpoint, method = "GET", data = null, token = null) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const json = await response.json();
    return { status: response.status, data: json };
}

async function runTest() {
    console.log("=== BẮT ĐẦU TEST KẾT BẠN ===");

    // 1. Đăng ký & Đăng nhập User A
    const userA_Data = {
        username: "usera_" + Date.now(),
        password: "password123",
        email: `usera_${Date.now()}@gmail.com`,
        first_name: "A",
        last_name: "User"
    };
    await request("/auth/register", "POST", userA_Data);
    let loginA = await request("/auth/login", "POST", { username: userA_Data.username, password: userA_Data.password });
    const tokenA = loginA.data.token;
    const idA = loginA.data.user.id;
    console.log("✅ User A đã đăng nhập. ID:", idA);

    // 2. Đăng ký & Đăng nhập User B
    const userB_Data = {
        username: "userb_" + Date.now(),
        password: "password123",
        email: `userb_${Date.now()}@gmail.com`,
        first_name: "B",
        last_name: "User"
    };
    await request("/auth/register", "POST", userB_Data);
    let loginB = await request("/auth/login", "POST", { username: userB_Data.username, password: userB_Data.password });
    const tokenB = loginB.data.token;
    const idB = loginB.data.user.id;
    console.log("✅ User B đã đăng nhập. ID:", idB);

    // 3. User A tìm kiếm User B
    const searchRes = await request(`/users/search?q=${userB_Data.username}`, "GET", null, tokenA);
    console.log("🔎 User A tìm User B:", searchRes.data.data.length > 0 ? "Thấy" : "Không thấy");

    // 4. User A gửi lời mời cho User B
    const sendReq = await request("/users/friends/requests", "POST", { to: idB, message: "Chào bạn, mình là A" }, tokenA);
    console.log("📨 User A gửi kết bạn:", sendReq.data.message);

    // 5. User B lấy danh sách lời mời
    const reqList = await request("/users/friends/requests", "GET", null, tokenB);
    const received = reqList.data.received;
    console.log("📩 User B có lời mời từ User A:", received.some(r => r.userId == idA));

    if (received.length > 0) {
        const reqId = received[0].id;
        
        // 6. User B chấp nhận lời mời
        const acceptReq = await request(`/users/friends/requests/${reqId}/accept`, "POST", null, tokenB);
        console.log("🤝 User B chấp nhận kết bạn:", acceptReq.data.message);
    }

    // 7. User A lấy danh sách bạn bè
    const friendsA = await request("/users/friends", "GET", null, tokenA);
    console.log("👥 Danh sách bạn của User A có User B không?", friendsA.data.friends.some(f => f.userId == idB));

    console.log("=== HOÀN TẤT TEST ===");
}

runTest();
