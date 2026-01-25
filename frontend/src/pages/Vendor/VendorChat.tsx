import { useContext, useState, useMemo, useEffect } from "react";
import AuthCon from "@/context/AuthContext";
import axios from "axios";
import { Card } from "react-bootstrap";
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  Sidebar,
  ConversationList,
  Conversation,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import type { UserT } from "@/types";

export default function VendorChatApp() {
  const { user, messages, setMessages } = useContext(AuthCon);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatPartners, setChatPartners] = useState<UserT[]>([]);

  const activeChatMessages = useMemo(
    () =>
      messages.filter(
        (m: any) =>
          (m.sender === user?._id && m.reciever === selectedUserId) ||
          (m.sender === selectedUserId && m.reciever === user?._id)
      ),
    [messages, selectedUserId, user?._id]
  );

  const handleSend = async (text: string) => {
    if (!selectedUserId || !user?._id) return;

    const newMessage = {
      sender: user._id,
      reciever: selectedUserId,
      text: text,
      direction: "outgoing",
    };

    setMessages([...messages, newMessage]);

    try {
      await axios.post(import.meta.env.VITE_BASE_URL + "/chat_entry", {
        chat: newMessage,
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    const fetchPartners = async () => {
      if (messages.length > 0 && user?._id) {
        const uniquePartners: UserT[] = [];
        const map = new Map();
        for (const chat of messages) {
          const partner =
            chat.sender === user._id
              ? chat.recieverDetails
              : chat.senderDetails;
          if (partner && !map.has(partner._id)) {
            map.set(partner._id, true);
            uniquePartners.push(partner);
          }
        }
        setChatPartners(uniquePartners);
      }
    };
    fetchPartners();
  }, [messages, user?._id]);

  return (
    <div style={{ padding: "20px", height: "90vh" }}>
      <Card
        className="shadow-sm"
        style={{ height: "100%", borderRadius: "15px", overflow: "hidden" }}
      >
        <MainContainer responsive style={{ height: "100%" }}>
          <Sidebar
            position="left"
            scrollable={true}
            style={{ width: "250px", display: "flex", flexDirection: "column" }}
          >
            <ConversationList>
              {chatPartners.map((partner) => (
                <Conversation
                  key={partner._id}
                  name={partner.username || "Unknown"}
                  active={selectedUserId === partner._id}
                  onClick={() => setSelectedUserId(partner._id)}
                ></Conversation>
              ))}
            </ConversationList>
          </Sidebar>

          {selectedUserId ? (
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Content
                  userName={`Chatting with ${
                    chatPartners.filter((cp) =>
                      cp._id == selectedUserId ? true : false
                    )[0].username
                  }
									`}
                />
              </ConversationHeader>
              <MessageList>
                {activeChatMessages.map((m: any, i: number) => (
                  <Message
                    key={i}
                    model={{
                      message: m.text,
                      sentTime: "just now",
                      sender: m.sender,
                      direction:
                        m.sender === user?._id ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type your message here..."
                onSend={handleSend}
                attachButton={false}
              />
            </ChatContainer>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
                background: "#fbfbfb",
              }}
            >
              <h5>Select a conversation to start chatting</h5>
            </div>
          )}
        </MainContainer>
      </Card>
    </div>
  );
}
