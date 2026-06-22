import express from "express";
import fs from "fs";
import path from "path";
import Item from "../models/Item.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

const editableFields = [
  "title",
  "description",
  "type",
  "category",
  "location",
  "incidentDate",
  "contactPhone"
];

function canManage(item, user) {
  return user.role === "admin" || item.createdBy.toString() === user._id.toString();
}

function removeImage(imagePath) {
  if (!imagePath) return;
  const filename = path.basename(imagePath);
  fs.unlink(path.join("uploads", filename), () => {});
}

router.get("/", async (req, res) => {
  const {
    search = "",
    type = "",
    category = "",
    status = "",
    sort = "newest",
    page = "1",
    limit = "12"
  } = req.query;

  const filter = {};
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { location: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } }
    ];
  }
  if (["lost", "found"].includes(type)) filter.type = type;
  if (category) filter.category = category;
  if (["open", "resolved", "returned"].includes(status)) filter.status = status;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    incident: { incidentDate: -1 }
  };

  const [items, total] = await Promise.all([
    Item.find(filter)
      .select("-claims")
      .populate("createdBy", "name email")
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Item.countDocuments(filter)
  ]);

  res.json({
    items,
    pagination: {
      page: pageNumber,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      total
    }
  });
});

router.get("/mine", protect, async (req, res) => {
  const items = await Item.find({ createdBy: req.user._id })
    .populate("claims.claimant", "name email")
    .sort({ createdAt: -1 });
  res.json({ items });
});

router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id)
    .select("-claims")
    .populate("createdBy", "name email");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ item });
});

router.post("/", protect, upload.single("image"), async (req, res) => {
  const item = await Item.create({
    ...Object.fromEntries(editableFields.map((field) => [field, req.body[field]])),
    image: req.file ? `/uploads/${req.file.filename}` : "",
    createdBy: req.user._id
  });
  await item.populate("createdBy", "name email");
  res.status(201).json({ item });
});

router.put("/:id", protect, upload.single("image"), async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (!canManage(item, req.user)) {
    return res.status(403).json({ message: "You can only edit your own posts" });
  }

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });
  if (req.file) {
    removeImage(item.image);
    item.image = `/uploads/${req.file.filename}`;
  }
  await item.save();
  await item.populate("createdBy", "name email");
  res.json({ item });
});

router.delete("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (!canManage(item, req.user)) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }
  removeImage(item.image);
  await item.deleteOne();
  res.json({ message: "Post deleted" });
});

router.patch("/:id/status", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (!canManage(item, req.user)) {
    return res.status(403).json({ message: "You cannot update this post" });
  }
  if (!["open", "resolved", "returned"].includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  item.status = req.body.status;
  await item.save();
  res.json({ item });
});

router.post("/:id/claims", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.createdBy.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot claim your own post" });
  }
  if (item.status !== "open") {
    return res.status(400).json({ message: "This item is already closed" });
  }
  const duplicate = item.claims.some(
    (claim) =>
      claim.claimant.toString() === req.user._id.toString() && claim.status === "pending"
  );
  if (duplicate) {
    return res.status(409).json({ message: "You already have a pending claim" });
  }
  item.claims.push({ claimant: req.user._id, message: req.body.message });
  await item.save();
  res.status(201).json({ message: "Claim request sent", item });
});

router.patch("/:id/claims/:claimId", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (!canManage(item, req.user)) {
    return res.status(403).json({ message: "You cannot manage claims for this post" });
  }
  if (!["approved", "rejected"].includes(req.body.status)) {
    return res.status(400).json({ message: "Claim status must be approved or rejected" });
  }
  const claim = item.claims.id(req.params.claimId);
  if (!claim) return res.status(404).json({ message: "Claim not found" });
  claim.status = req.body.status;
  if (claim.status === "approved") {
    item.status = item.type === "found" ? "returned" : "resolved";
    item.claims.forEach((entry) => {
      if (entry._id.toString() !== claim._id.toString() && entry.status === "pending") {
        entry.status = "rejected";
      }
    });
  }
  await item.save();
  await item.populate("claims.claimant", "name email");
  res.json({ item });
});

export default router;
