import express, { type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRouter from "../Routers/user";
import contentRouter from "../Routers/content";
import { prisma } from "../lib/prisma";

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://second-brain-frontend-beryl.vercel.app",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

// Health check
app.get("/api/health", async (_req, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ ok: true, users: userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
});

// Error handler
app.use((err: any, _req: any, res: Response, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;