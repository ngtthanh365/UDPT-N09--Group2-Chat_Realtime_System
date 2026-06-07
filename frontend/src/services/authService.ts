import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post("/auth/register", {
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    });
    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post("/auth/login", { username, password });
    const userData = res.data.user;
    return {
      token: res.data.token,
      user: {
        _id: userData.id.toString(),
        username: userData.username,
        email: userData.email,
        displayName: `${userData.first_name} ${userData.last_name}`,
      }
    };
  },

  signOut: async () => {
    return Promise.resolve(true);
  },

  fetchMe: async (userId: string) => {
    const res = await api.get(`/users/${userId}`);
    const userData = res.data.user;
    return {
      _id: userData.id.toString(),
      username: userData.username,
      email: userData.email,
      displayName: `${userData.first_name} ${userData.last_name}`,
    };
  },
};
