import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import User from "../db/User.ts";
import { CustomPayload } from "../routes/UserRou.ts";
import { Env } from "../../types.ts";

export const authM = createMiddleware<Env>(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWTOKEN_SECRET || "11";
    const payload: CustomPayload = await verify(token, secret);

    const user = await User.findById(payload.user._id);
    if (!user) {
      throw new HTTPException(404, { message: "User not Found" });
    }

    c.set("user", {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      type: user.type,
    });
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: "Invalid Token" });
  }
});
