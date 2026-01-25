import { Hono } from "hono";
import Vendor from "../db/Vendor.ts";

// Initialize as Hono instance (required for app.route)
export const router = new Hono();

// GET: Vendor by ID
router.get("/vendor/:vendorID", async (c) => {
  const vendorID = c.req.param("vendorID");
  const vendor = await Vendor.findOne({ vendorID });
  return c.json({ vendor });
});

// GET: Search Vendors
router.get("/vendors/search", async (c) => {
  try {
    // Hono uses c.req.query() to get search params
    const { location, availability, minPricing, maxPricing } = c.req.query();

    const query: any = {};

    if (location) {
      const escapedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.location = { $regex: escapedLocation, $options: "i" };
    }

    if (availability !== undefined && availability !== "all") {
      query.availability = availability === "true";
    }

    if (minPricing || maxPricing) {
      query.pricing = {};
      if (minPricing) query.pricing.$gte = Number(minPricing);
      if (maxPricing) query.pricing.$lte = Number(maxPricing);
    }

    const vendors = await Vendor.find(query);
    return c.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST: Create Vendor
router.post("/vendor", async (c) => {
  const body = await c.req.json();
  const ven = await Vendor.create(body.vendor);
  return c.json({ vendor: ven });
});

// PUT: Update Vendor
router.put("/vendor", async (c) => {
  const body = await c.req.json();
  const ven = await Vendor.findOneAndUpdate(
    { vendorID: body.vendor.vendorID },
    body.vendor,
    { new: true }
  );
  return c.json({ vendor: ven });
});

// DELETE: Delete Vendor
router.delete("/vendor/:vendorID", async (c) => {
  const vendorID = c.req.param("vendorID");
  const ven = await Vendor.findOne({ vendorID });
  await Vendor.findOneAndDelete({ vendorID });
  return c.json({ vendor: ven });
});
