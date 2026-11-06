import { Router } from "express";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";
import JWT_SECRET from "../config";
import userMiddleware from "../middlewares/user";

const userRouter = Router();
const client = prisma;

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

userRouter.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required." });
  }

  const userExists = await client.user.findFirst({ where: { email } });

  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  try {
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await client.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = Jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      msg: "User created Successfully",
      token,
    });
  } catch (e) {
    return res.status(400).json({ error: "Error creating user" });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await client.user.findFirst({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = Jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      msg: "Signed In successfully",
      token,
    });
  } catch (e) {
    return res.status(400).json({ error: "Error signing in." });
  }
});

userRouter.get("/me", userMiddleware, async (req, res) => {
  try {
    const user = await client.user.findUnique({
      where: { id: Number(req.userId) },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(user);
  } catch (e) {
    return res.status(400).json({ error: "Error fetching profile." });
  }
});

export default userRouter;
