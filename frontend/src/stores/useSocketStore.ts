import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { toast } from "sonner";

const baseURL = import.meta.env.MODE === "development" ? "http://localhost" : "/";

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("new_conversation", (conversation) => {
      // Mapping for new conversation just like chatService does
      const mappedConvo = {
        ...conversation,
        participants: (conversation.participants || conversation.members || []).map((m: any) => ({
          _id: m._id || m.id?.toString() || m.toString(),
          displayName: m.displayName || `User ${m}`,
          avatarUrl: m.avatarUrl || null,
          username: m.username || null
        })),
        unreadCounts: conversation.unreadCounts || {},
        seenBy: conversation.seenBy || [],
        lastMessage: conversation.lastMessage || null,
      };
      useChatStore.getState().addConvo(mappedConvo);
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
      socket.emit("authenticate", accessToken);
      const activeConvoId = useChatStore.getState().activeConversationId;
      if (activeConvoId) {
        socket.emit("join_conversation", activeConvoId);
      }
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // receive message
    socket.on("receive_message", (messageData) => {
      const { user } = useAuthStore.getState();
      const activeConvoId = useChatStore.getState().activeConversationId;

      if (activeConvoId === messageData.conversationId) {
        useChatStore.getState().addMessage({
          _id: messageData._id,
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          content: messageData.content,
          imgUrl: messageData.mediaUrl || messageData.imgUrl || null,
          createdAt: messageData.createdAt,
          isOwn: messageData.senderId === user?._id,
        });

        if (messageData.senderId !== user?._id) {
          useChatStore.getState().markAsSeen();
        }
      }

      const lastMessage = {
        _id: messageData._id,
        content: messageData.content,
        createdAt: messageData.createdAt,
        sender: {
          _id: messageData.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const existingConvo = useChatStore.getState().conversations.find((c: any) => c._id === messageData.conversationId);
      const userUnread = (existingConvo?.unreadCounts?.[user?._id ?? ""] || 0);
      const unreadCounts = (messageData.senderId !== user?._id && activeConvoId !== messageData.conversationId)
        ? { ...existingConvo?.unreadCounts, [user?._id ?? ""]: userUnread + 1 }
        : existingConvo?.unreadCounts || {};

      useChatStore.getState().updateConversation({
        _id: messageData.conversationId,
        lastMessage,
        unreadCounts,
      });

      if (messageData.senderId !== user?._id && document.hidden) {
        if (Notification.permission === "granted") {
          let senderName = "Tin nhắn mới";
          let avatarUrl = "";
          if (existingConvo) {
            const participant = existingConvo.participants.find((p: any) => p._id.toString() === messageData.senderId.toString());
            if (participant) {
              senderName = participant.displayName;
              avatarUrl = participant.avatarUrl;
            }
          }
          const messageText = messageData.content || (messageData.mediaUrl ? "Đã gửi một hình ảnh" : "Bạn có tin nhắn mới");

          const notification = new Notification(senderName, {
            body: messageText,
            icon: avatarUrl || undefined,
            tag: messageData.conversationId,
            renotify: true,
          });
          notification.onclick = () => {
            window.focus();
            useChatStore.getState().setActiveConversation(messageData.conversationId);
            notification.close();
          };
        }
      }
    });

    // new message (deprecated, using receive_message)
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      if (Notification.permission === "granted") {
        new Notification("Tin nhắn mới", {
          body: message.content || "Bạn có tin nhắn mới",
        });
      }

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts: unreadCounts || {},
      };

      if (useChatStore.getState().activeConversationId === message.conversationId) {
        useChatStore.getState().markAsSeen();
      }

      useChatStore.getState().updateConversation(updatedConversation);
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts || {},
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join_conversation", conversation._id);
    });

    // new notification
    socket.on("new_notification", (data) => {
      if (data.type === "friend_request") {
        import("./useFriendStore").then((module) => {
          module.useFriendStore.getState().getAllFriendRequests();
          module.useFriendStore.getState().getFriends();
        });
        toast.info("Yêu cầu kết bạn", {
          description: data.content || "Bạn nhận được một lời mời kết bạn mới",
        });

        if (Notification.permission === "granted") {
          const notification = new Notification("Yêu cầu kết bạn", {
            body: data.content || "Bạn nhận được một lời mời kết bạn mới",
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
      }

      if (data.type === "message") {
        const activeConvoId = useChatStore.getState().activeConversationId;
        const user = useAuthStore.getState().user;
        const isOwn = data.message?.senderId === user?._id;

        useChatStore.getState().fetchConversations().then(() => {
          // Hiện thông báo khi có tin nhắn mới từ người khác và không phải cuộc trò chuyện đang active
          if (!isOwn && activeConvoId !== data.message?.conversationId) {
            const conversations = useChatStore.getState().conversations;
            const convo = conversations.find((c: any) => c._id === data.message.conversationId);
            let senderName = "Tin nhắn mới";
            let avatarUrl = "";
            if (convo) {
              const participant = convo.participants.find((p: any) => p._id.toString() === data.message.senderId.toString());
              if (participant) {
                senderName = participant.displayName;
                avatarUrl = participant.avatarUrl;
              }
            }
            const messageText = data.message.content || (data.message.mediaUrl ? "Đã gửi một hình ảnh" : "Bạn có tin nhắn mới");

            // 1. Hiện Sonner toast trong trang web (dành cho khi tab đang mở)
            toast(senderName, {
              description: messageText,
              action: {
                label: "Xem",
                onClick: () => {
                  window.focus();
                  useChatStore.getState().setActiveConversation(data.message.conversationId);
                }
              }
            });

            // 2. Hiện thông báo hệ thống (ngoài trang web - Zalo style) khi tab ẩn/bị thu nhỏ
            if (Notification.permission === "granted" && document.hidden) {
              const notification = new Notification(senderName, {
                body: messageText,
                icon: avatarUrl || undefined,
                tag: data.message.conversationId,
                renotify: true,
              });
              notification.onclick = () => {
                window.focus();
                useChatStore.getState().setActiveConversation(data.message.conversationId);
                notification.close();
              };
            }
          }
        });

        if (data.message && activeConvoId === data.message.conversationId) {
          useChatStore.getState().addMessage({
            _id: data.message._id,
            conversationId: data.message.conversationId,
            senderId: data.message.senderId,
            content: data.message.content,
            imgUrl: data.message.mediaUrl, // Ánh xạ mediaUrl sang imgUrl cho client
            createdAt: data.message.createdAt,
            isOwn,
          });
          useChatStore.getState().markAsSeen();
        }
      }
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

if ("Notification" in window) {
  Notification.requestPermission();
}

