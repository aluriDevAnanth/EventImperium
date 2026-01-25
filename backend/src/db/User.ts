import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, enum: ["EventUser", "Vendor", "Guest"], required: true },
}, { timestamps: true })

const User = mongoose.model("users", UserSchema)

export default User;