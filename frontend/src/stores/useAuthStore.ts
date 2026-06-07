import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { useChatStore } from "./useChatStore";


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset();
      },

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });

          await authService.signUp(username, password, email, firstName, lastName);

          toast.success("Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.");
        } catch (error: any) {
          console.error(error);
          toast.error(error.response?.data?.message || "Đăng ký không thành công");
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (username, password) => {
        try {
          set({ loading: true });

          const data = await authService.signIn(username, password);
          
          set({ 
            accessToken: data.token,
            user: data.user
          });

          toast.success("Chào mừng bạn quay lại với Universe");
        } catch (error: any) {
          console.error(error);
          toast.error(error.response?.data?.message || "Đăng nhập không thành công!");
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Logout thành công!");
        } catch (error) {
          console.error(error);
          toast.error("Lỗi xảy ra khi logout. Hãy thử lại!");
        }
      },

      fetchMe: async () => {
        try {
          const state = get();
          if (!state.user || !state.user._id) return;
          
          set({ loading: true });
          const user = await authService.fetchMe(state.user._id);
          set({ user });
        } catch (error) {
          console.error(error);
          set({ user: null, accessToken: null });
          toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        } finally {
          set({ loading: false });
        }
      },

      refresh: async () => {
        // Backend chưa có /refresh. Tạm thời clearState nếu gọi đến (hoặc bỏ không dùng).
        get().clearState();
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
    }
  )
);
