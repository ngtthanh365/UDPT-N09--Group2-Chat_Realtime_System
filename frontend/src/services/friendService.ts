import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/search/users?keyword=${username}`);
    const results = res.data.data || [];
    return results.map((u: any) => ({
      _id: u.id?.toString(),
      username: u.username,
      email: u.email,
      displayName: `${u.first_name} ${u.last_name}`,
      avatarUrl: null
    }));
  },

  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/users/friends/requests", { to, message });
    return res.data.message;
  },

  async getAllFriendRequest() {
    try {
      const res = await api.get("/users/friends/requests");
      const { sent, received } = res.data;

      const mapRequest = (req: any, isSent: boolean) => ({
        _id: req.id.toString(),
        from: isSent ? undefined : {
          _id: req.userId.toString(),
          username: req.username,
          displayName: `${req.first_name} ${req.last_name}`,
          avatarUrl: undefined
        },
        to: isSent ? {
          _id: req.userId.toString(),
          username: req.username,
          displayName: `${req.first_name} ${req.last_name}`,
          avatarUrl: undefined
        } : undefined,
        message: "", // backend doesn't store messages for friend requests yet
        createdAt: req.createdAt,
        updatedAt: req.createdAt
      });

      return {
        sent: sent.map((r: any) => mapRequest(r, true)),
        received: received.map((r: any) => mapRequest(r, false))
      };
    } catch (error) {
      console.error("Lỗi khi gọi getAllFriendRequest", error);
      return { sent: [], received: [] };
    }
  },

  async acceptRequest(requestId: string) {
    const res = await api.post(`/users/friends/requests/${requestId}/accept`);
    return res.data;
  },

  async declineRequest(requestId: string) {
    const res = await api.post(`/users/friends/requests/${requestId}/decline`);
    return res.data;
  },

  async getFriendList() {
    const res = await api.get("/users/friends");
    return res.data.friends.map((f: any) => ({
      _id: f.userId.toString(),
      username: f.username,
      displayName: `${f.first_name} ${f.last_name}`,
      avatarUrl: undefined
    }));
  },
};
