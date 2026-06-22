import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { createToken } from "../utils/token.js";

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: adminEmails.includes(normalizedEmail) ? "admin" : "user"
  });

  res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password || ""))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  res.json({ token: createToken(user._id), user: publicUser(user) });
});

router.get("/me", protect, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;

