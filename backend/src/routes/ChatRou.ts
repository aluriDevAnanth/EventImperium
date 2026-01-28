import { Hono } from "hono";
import { Chat } from "src/db/Chat.ts";
import User from "src/db/User.ts";
import { authM } from "src/middlewares/authM.ts";
import type { Server } from "socket.io";
import { io, userSocketMap } from "@/scoketIO.ts";
export const router = new Hono();

async function sendPrivateMessage(userId: string, data: any): Promise<boolean> {
  const socketId = userSocketMap.get(userId);
  if (!socketId || !io) return false;

  try {
    io.to(socketId).emit("push_chat", data);
    return true;
  } catch (error) {
    return false;
  }
}

router.post("/api/v1/chat_entry", async (c) => {
  try {
    const body = await c.req.json();
    const chatt = await Chat.create(body.chat);
    const sent = await sendPrivateMessage(chatt.reciever, body.chat);

    return c.json({
      chat: chatt,
      delivered: sent,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

router.get("/api/v1/getMessages/:userId", authM, async (c) => {
  try {
    const userId = c.req.param("userId");

    const chats = await Chat.find({
      $or: [{ sender: userId }, { reciever: userId }],
    })
      .sort({ timestamp: 1 })
      .lean();

    const userIds = [
      ...new Set([
        ...chats.map((c) => c.sender),
        ...chats.map((c) => c.reciever),
      ]),
    ];

    const users = await User.find({ _id: { $in: userIds } });

    const userMap: Record<string, any> = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = {
        _id: u._id,
        username: u.username,
      };
    });

    const enrichedChats = chats.map((chat) => ({
      ...chat,
      senderDetails: userMap[chat.sender.toString()] || { username: "Unknown" },
      recieverDetails: userMap[chat.reciever.toString()] || {
        username: "Unknown",
      },
    }));

    return c.json({ chats: enrichedChats });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
