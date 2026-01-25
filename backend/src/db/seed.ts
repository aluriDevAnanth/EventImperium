import User from "./User.ts";
import Vendor from "./Vendor.ts";
import Event from "./Event.ts";
import { hash, compare } from "bcrypt-ts";

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding Users...");
      const saltRounds = 10;
      const hashedPassword = await hash("qqq", saltRounds);

      await User.insertMany([
        {
          username: "eventuser1",
          email: "eventuser1@qqq.com",
          password: hashedPassword,
          type: "EventUser",
        },
        {
          username: "guest1",
          email: "guest1@qqq.com",
          password: hashedPassword,
          type: "Guest",
        },
        {
          username: "guest2",
          email: "guest2@qqq.com",
          password: hashedPassword,
          type: "Guest",
        },
        {
          username: "guest3",
          email: "guest3@qqq.com",
          password: hashedPassword,
          type: "Guest",
        },
        {
          username: "vendor1",
          email: "vendor1@qqq.com",
          password: hashedPassword,
          type: "Vendor",
        },
        {
          username: "vendor2",
          email: "vendor1@qqq.com",
          password: hashedPassword,
          type: "Vendor",
        },
      ]);
    }

    const vendorCount = await Vendor.countDocuments();
    let seededVendors = [];

    if (vendorCount === 0) {
      console.log("Seeding Vendors...");
      const vendorUsers = await User.find({ type: "Vendor" });

      seededVendors = await Vendor.insertMany([
        {
          vendorID: vendorUsers[0]._id.toString(),
          name: "Grand Ballroom",
          location: "Downtown",
          availability: true,
          pricing: 5000,
          services: "Venue",
        },
        {
          vendorID: vendorUsers[1]._id.toString(),
          name: "Elite Catering",
          location: "Midtown",
          availability: true,
          pricing: 1500,
          services: "Food & Beverage",
        },
      ]);
    } else {
      seededVendors = await Vendor.find();
    }

    const eventCount = await Event.countDocuments();
    if (eventCount === 0 && seededVendors.length > 0) {
      const adminUser = await User.findOne({ type: "EventUser" });

      console.log("Seeding Events...");
      await Event.create({
        name: "Annual Gala 2025",
        des: "Year-end celebration event",
        userID: adminUser?._id.toString() || "manual_id",
        datetime: new Date("2025-12-31"),
        location: "New York",
        budget: 10000,
        typee: "Corporate",
        images: ["images.unsplash.com"],
        guests: [{ email: "www1@www.com", status: "Appected" }],
        vendors: [seededVendors[0]._id],
        expenses: [
          {
            name: "Initial Deposit",
            amount: 1000,
            typee: "Others",
            vendorID: seededVendors[0]._id,
          },
        ],
      });
    }

    console.log("Database seeding check completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

export default seedData;
