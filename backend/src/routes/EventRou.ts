import { Hono } from "hono";
import Event from "src/db/Event.ts";
import { pb } from "@/main.ts";
import { authM } from "../middlewares/authM.ts";

export const router = new Hono();

const errorRes = (c: any, message: string, status: number = 500) =>
  c.json({ success: false, error: message }, status);

router.get("/events/:userID", authM, async (c) => {
  try {
    const userID = c.req.param("userID");
    const events = await Event.find({ userID });
    return c.json({ events: events });
  } catch (err) {
    return errorRes(c, "Failed to fetch user events");
  }
});

router.get("/event/:id", authM, async (c) => {
  try {
    const event = await Event.findById(c.req.param("id"));
    if (!event) return errorRes(c, "Event not found", 404);
    return c.json({ event: event });
  } catch (err) {
    return errorRes(c, "Invalid Event ID", 400);
  }
});

router.post("/event", authM, async (c) => {
  try {
    const body = await c.req.json();
    const newEvent = await Event.create(body);
    return c.json({ event: newEvent }, 201);
  } catch (err) {
    return errorRes(c, "Failed to create event", 400);
  }
});

router.put("/event", authM, async (c) => {
  try {
    const body = await c.req.json();

    const updatedEve = await Event.findByIdAndUpdate(body._id, body, {
      new: true,
    });
    if (!updatedEve) return errorRes(c, "Event not found", 404);

    return c.json({ event: updatedEve });
  } catch (err) {
    return errorRes(c, "Update failed", 400);
  }
});

router.delete("/event", authM, async (c) => {
  try {
    const body = await c.req.json();
    const deletedEve = await Event.findByIdAndDelete({ _id: body._id });
    if (!deletedEve) return errorRes(c, "Event not found", 404);
    return c.json({ event: deletedEve });
  } catch (err) {
    return errorRes(c, "Deletion failed");
  }
});

router.get("/event/invitations/:email", authM, async (c) => {
  try {
    const email = c.req.param("email");
    const invitations = await Event.find({ "guests.email": email });
    return c.json({ invitations: invitations });
  } catch (err) {
    return errorRes(c, "Failed to fetch invitations");
  }
});

router.post("/uploadFile", authM, async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData["file"];

    if (!(file instanceof File)) {
      return errorRes(c, "No valid file uploaded", 400);
    }

    const pbData = new FormData();
    pbData.append("file", file);

    const record = await pb.collection("files").create(pbData);

    return c.json(
      {
        thumbnail: record.id,
      },
      201,
    );
  } catch (err: any) {
    return errorRes(c, err.message || "Upload failed");
  }
});

router.get("/files/:id", authM, async (c) => {
  try {
    const record = await pb.collection("files").getOne(c.req.param("id"));
    const fileUrl = pb.files.getURL(record, record.file);

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Storage unavailable");

    return c.body(response.body, 200, {
      "Content-Type":
        response.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    });
  } catch (err: any) {
    return errorRes(c, "File not found", 404);
  }
});
