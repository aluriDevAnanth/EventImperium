import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    text: { type: String },
    sender: { type: String, required: true },
    reciever: { type: String, required: true },
    eventID: { type: String, required: true },
  },
  { timestamps: true },
);

export const Chat = mongoose.model("chats", ChatSchema);
