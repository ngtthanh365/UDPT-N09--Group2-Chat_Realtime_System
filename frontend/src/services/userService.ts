import api from "@/lib/axios";
import type { User } from "@/types/user";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const res = await api.get("/users");
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put("/users/profile", data);
    return res.data.user;
  },
};
