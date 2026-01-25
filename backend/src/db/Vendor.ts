import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
    vendorID: { type: String },
    name: { type: String },
    location: { type: String },
    availability: { type: Boolean },
    pricing: { type: Number },
    services: { type: String },
    reviews: [{ type: String }],
})

const Vendor = mongoose.model("vendors", VendorSchema)

export default Vendor;