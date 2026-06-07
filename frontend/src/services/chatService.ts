import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    const mapped = res.data.conversations.map((conv: any) => ({
      _id: conv._id,
      type: conv.members?.length > 2 ? "group" : "direct",
      group: null,
      participants: (conv.participants || conv.members || []).map((m: any) => ({
        _id: m._id || m.id?.toString() || m.toString(),
        displayName: m.displayName || `User ${m}`,
        avatarUrl: m.avatarUrl || null,
        username: m.username || null
      })),
      lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
      seenBy: [],
      lastMessage: conv.lastMessage ? {
        _id: conv.lastMessage._id,
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        sender: {
          _id: conv.lastMessage.sender?._id || conv.lastMessage.sender?.id?.toString() || conv.lastMessage.senderId?.toString(),
          displayName: conv.lastMessage.sender?.displayName || `User ${conv.lastMessage.senderId}`,
          avatarUrl: conv.lastMessage.sender?.avatarUrl || null,
        }
      } : null,
      unreadCounts: {},
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));
    return { conversations: mapped };
  },

  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    // The backend getMessages doesn't currently support cursor/limit, but we pass it anyway
    const res = await api.get(`/messages/${id}?cursor=${cursor}`);
    
    // The backend returns an array of messages directly instead of { messages, nextCursor }
    // We will adapt the format
    const rawMessages = Array.isArray(res.data) ? res.data : (res.data.messages || []);
    const messages = rawMessages.map((msg: any) => ({
      _id: msg._id,
      conversationId: msg.conversationId,
      senderId: msg.senderId?.toString(),
      content: msg.content,
      imgUrl: msg.mediaUrl, // map mediaUrl to imgUrl
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
    return { messages, cursor: undefined };
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    file?: File,
    conversationId?: string
  ) {
    let res;
    if (file) {
      const formData = new FormData();
      formData.append("conversationId", conversationId || recipientId);
      formData.append("content", content);
      formData.append("type", "image");
      formData.append("media", file);

      res = await api.post("/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      res = await api.post("/messages", {
        conversationId: conversationId || recipientId,
        content,
        type: "text",
      });
    }

    const msg = res.data.data;
    return {
      _id: msg._id,
      conversationId: msg.conversationId,
      senderId: msg.senderId?.toString(),
      content: msg.content,
      imgUrl: msg.mediaUrl, // Ánh xạ mediaUrl sang imgUrl
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    };
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    file?: File
  ) {
    return this.sendDirectMessage("", content, file, conversationId);
  },

  async markAsSeen(conversationId: string) {
    // Backend doesn't support markAsSeen yet, just mock it
    return Promise.resolve();
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[]
  ) {
    // Backend only supports creating direct conversation with `receiverId`
    const receiverId = memberIds.find((id) => id !== useAuthStore.getState().user?.id?.toString());
    const res = await api.post("/conversations", { receiverId });
    return res.data.conversation;
  },
};

