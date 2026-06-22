import express from "express";
import Item from "../models/Item.js";
import User from "../models/User.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats", async (_req, res) => {
  const [users, totalItems, openItems, lostItems, foundItems, recentItems, claimData] =
    await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ status: "open" }),
      Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }),
      Item.find().populate("createdBy", "name email").sort({ createdAt: -1 }).limit(8),
      Item.aggregate([
        { $unwind: { path: "$claims", preserveNullAndEmptyArrays: false } },
        { $match: { "claims.status": "pending" } },
        { $count: "total" }
      ])
    ]);

  res.json({
    stats: {
      users,
      totalItems,
      openItems,
      lostItems,
      foundItems,
      pendingClaims: claimData[0]?.total || 0
    },
    recentItems
  });
});

router.get("/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

export default router;

