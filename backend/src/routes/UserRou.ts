import { Hono } from "hono";
import { sign } from "hono/jwt";
import { hash, compare } from "bcrypt-ts";
import User from "../db/User.ts";
import { authM } from "../middlewares/authM.ts";
import { JWTPayload } from "hono/utils/jwt/types";

export const router = new Hono();

export interface CustomPayload extends JWTPayload {
  user?: {
    _id: string;
  };
  [key: string]: any;
}

router.post("/signup", async (c) => {
  const body = await c.req.json();
  const pass = await hash(body.password, 10);
  await User.create({ ...body, password: pass });
  return c.json({ status: "success" });
});

router.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const user1 = await User.findOne({ username: body.username });

    if (!user1) return c.json({ error: "Not Found" }, 404);

    const match = await compare(body.password, user1.password);
    if (!match) return c.json({ error: "Wrong Password" }, 401);

    const secret = process.env.JWTOKEN_SECRET || "11";
    const payload: CustomPayload = {
      user: { _id: user1._id.toString() },
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2, // 2 days in seconds
    };

    const token = await sign(payload, secret);
    return c.json({ token, user: user1 });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

router.get("/auth", authM, async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "User not Found" }, 404);
  return c.json({ user });
});
