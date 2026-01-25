import { Hono } from "hono";
import { Chat } from "../db/Chat.ts";
import User from "../db/User.ts";
import { authM } from "../middlewares/authM.ts";
import { createResponse, createSession } from "better-sse";
import { activeClients } from "../../main.ts";

export const router = new Hono();

router.get("/chat", (c) => {
  const userId = c.req.query("userId") || "anonymous";

  return createResponse(c.req.raw, (session) => {
    session.state = {
      userId,
      connectedAt: new Date(),
    };

    activeClients.set(userId, session);

    session.on("disconnected", () => {
      activeClients.delete(userId);
      console.log(`User ${userId} disconnected.`);
    });

    session.push({ message: "Connected!" }, "status");
  });
});

function sendPrivateMessage(userId, data) {
  const session = activeClients.get(userId);
  if (session) {
    session.push(data, "push_chat");
    return true;
  }
  return false;
}

router.post("/chat_entry", async (c) => {
  try {
    const body = await c.req.json();
    console.log(body.chat);

    const chatt = await Chat.create(body.chat);

    sendPrivateMessage(chatt.reciever, body.chat);

    return c.json({
      chat: chatt,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

router.get("/getMessages/:userId", authM, async (c) => {
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
