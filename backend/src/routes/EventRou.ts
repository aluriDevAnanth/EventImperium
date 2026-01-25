import { Hono } from "hono";
import Event from "../db/Event.ts";

export const router = new Hono();

router.get("/events/:userID", async (c) => {
  const userID = c.req.param("userID");
  const events = await Event.find({ userID });
  return c.json({ events });
});

router.get("/event/:id", async (c) => {
  const id = c.req.param("id");
  const event = await Event.find({ _id: id });
  return c.json({ event });
});

router.post("/event", async (c) => {
  const body = await c.req.json();
  console.log(body);

  if (body.thumbnail) {
    const pb = c.req.parseBody();
    console.log(111, pb);
  }

  const eve = await Event.create(body);
  return c.json({ event: eve });
});

router.put("/event", async (c) => {
  try {
    // const body = await c.req.json();
    // console.log("Updating event ID:", body._id);

    const pb = await c.req.parseBody();
    console.log(111, pb);

    const updatedEve = await Event.findOneAndUpdate({ _id: body._id }, body, {
      new: true,
    });

    if (!updatedEve) {
      return c.json({ message: "Event not found" }, 404);
    }

    return c.json({ event: updatedEve });
  } catch (error) {
    console.error("Update Error:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

router.delete("/event", async (c) => {
  const body = await c.req.json();
  const eve = await Event.findOne({ _id: body._id });
  console.log(eve);

  await Event.findOneAndDelete({ _id: body._id });
  return c.json({ event: eve });
});

router.get("/event/my_invitations/:email", async (c) => {
  const userEmail = c.req.param("email");

  const invitations = await Event.find({
    "guests.email": userEmail,
  });

  return c.json(invitations, 200);
});
