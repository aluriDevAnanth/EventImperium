import axios from "axios";
import React, { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Cookies from "js-cookie";
import type { Chat, UserT } from "@/types";
import { io, Socket } from "socket.io-client";

type AuthConT = {
  user: null | UserT;
  setUser: React.Dispatch<React.SetStateAction<null | UserT>>;
  auth: null | string;
  setAuth: React.Dispatch<React.SetStateAction<null | string>>;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  showInvi: boolean;
  setShowInvi: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthCon = createContext<AuthConT>({
  user: null,
  setUser: () => {},
  auth: null,
  setAuth: () => {},
  messages: [],
  setMessages: () => {},
  showInvi: false,
  setShowInvi: () => {},
});

export function AuthPro({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | UserT>(null);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [auth, setAuth] = useState<null | string>(
    Cookies.get("EventEmpireAuth") ?? null,
  );
  const [showInvi, setShowInvi] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  async function fetchMessages() {
    if (!user?._id) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/getMessages/${user._id}`,
        {
          headers: { Authorization: `Bearer ${auth}` },
        },
      );
      setMessages(res.data.chats);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }

  useEffect(() => {
    if (auth) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/auth`, {
          headers: { Authorization: `Bearer ${auth}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setAuth(null);
          Cookies.remove("EventEmpireAuth");
        });
    }
  }, []);

  useEffect(() => {
    if (user?._id) fetchMessages();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !auth) return;

    const socket = io("http://localhost:3000", {
      path: "/socket.io/",
      query: { userId: user._id },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("push_chat", (data) => {
      console.log(data);

      setMessages((prev) => {
        const exists = prev.some((m) => m.sender == data.sender);
        console.log(1, exists);

        return !exists ? prev : [...prev, data];
      });
    });

    socket.on("connect", () => console.log("Connected to Socket.io"));
    socket.on("connect_error", (err) => console.error("Socket Error:", err));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, auth]);

  return (
    <AuthCon.Provider
      value={{
        user,
        setUser,
        auth,
        setAuth,
        messages,
        setMessages,
        showInvi,
        setShowInvi,
      }}
    >
      {children}
    </AuthCon.Provider>
  );
}

export default AuthCon;
