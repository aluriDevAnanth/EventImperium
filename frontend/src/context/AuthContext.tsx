import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Cookies from "js-cookie";
import type { Chat, UserT } from "@/types";

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

  async function fetchMessages() {
    const res = await axios.get(
      import.meta.env.VITE_BASE_URL + `/getMessages/${user?._id}`,
      {
        headers: { Authorization: `Bearer ${auth}` },
      },
    );
    setMessages(res.data.chats);
  }

  useEffect(() => {
    if (auth) {
      axios
        .get(import.meta.env.VITE_BASE_URL + "/auth", {
          headers: { Authorization: `Bearer ${auth}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setAuth(null);
          Cookies.remove("EventEmpireAuth");
        });
    }
  }, []);

  /* useEffect(() => {
    if (!user?._id || !auth) return;

    const url = `${import.meta.env.VITE_BASE_URL}/chat?userId=${user._id}`;

    const eventSource = new EventSource(url);

    const handlePushChat = (event: MessageEvent) => {
      try {
        const data: Chat = JSON.parse(event.data);
        setMessages((prev) => { 
          const exists = prev.some((m) => m.sender === data.sender);
          return exists ? prev : [...prev, data];
        });
      } catch (err) {
        console.error("SSE Parse Error", err);
      }
    };

    eventSource.addEventListener("push_chat", handlePushChat);

    eventSource.onerror = (err) => {
      console.error("SSE Connection error", err);
    };

    return () => {
      eventSource.removeEventListener("push_chat", handlePushChat);
      eventSource.close();
    };
  }, [user?._id, auth]); */

  useEffect(() => {
    if (user && user._id) fetchMessages();
  }, [user]);

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
