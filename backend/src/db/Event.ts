import mongoose from "mongoose";

const GuestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  status: {
    type: String,
    enum: ["Appected", "Rejected", "Pending"],
    required: true,
  },
});

const ExpenseSchema = new mongoose.Schema({
  name: { type: String },
  amount: { type: Number },
  typee: { type: String, enum: ["Vendor", "Others"] },
  vendorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vendors",
    required: true,
  },
  paymentID: { type: String },
});

const VendorSchema = new mongoose.Schema({
  name: { type: String },
  location: { type: String },
  availability: { type: Boolean },
  pricing: { type: Number },
  services: { type: String },
  reviews: [{ type: String }],
});

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    des: { type: String, required: true },
    userID: { type: String, required: true },
    datetime: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    expenses: [ExpenseSchema],
    typee: { type: String, required: true },
    invitation: { type: String },
    guests: [GuestSchema],
    vendors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "vendors", required: true },
    ],
    thumbnail: String,
  },
  { timestamps: true },
);

const Event = mongoose.model("events", EventSchema);

export default Event;
