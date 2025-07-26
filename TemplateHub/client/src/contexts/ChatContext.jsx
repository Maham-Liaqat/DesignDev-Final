import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_CONFIG from '../config/api';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [readStatus, setReadStatus] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const newSocket = io(API_CONFIG.BASE_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("typing", ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
    });
    newSocket.on("stop_typing", ({ userId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });
    newSocket.on("messages_read", ({ conversationId, userId }) => {
      setReadStatus((prev) => ({ ...prev, [conversationId]: userId }));
    });

    return () => newSocket.disconnect();
  }, []);

  return (
    <ChatContext.Provider value={{ socket, typingUsers, readStatus }}>
      {children}
    </ChatContext.Provider>
  );
}; 