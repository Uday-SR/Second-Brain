import express, { type Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import userRouter from "./routers/user";
import contentRouter from "./routers/content";
import cors from "cors";

import { prisma } from "./lib/prisma.js"; 

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "https://second-brain-frontend-beryl.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

// Health check route 
app.get("/api/health", async (_req, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ ok: true, users: userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
});

export default app;
