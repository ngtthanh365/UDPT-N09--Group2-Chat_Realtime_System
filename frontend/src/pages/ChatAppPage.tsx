import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useEffect } from "react";

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);
  const { fetchConversations } = useChatStore();
  const connectSocket = useSocketStore((s) => s.connectSocket);
  const disconnectSocket = useSocketStore((s) => s.disconnectSocket);

  useEffect(() => {
    if (user) {
      fetchConversations();
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user, fetchConversations, connectSocket, disconnectSocket]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex w-full">
          <ChatWindowLayout />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatAppPage;
