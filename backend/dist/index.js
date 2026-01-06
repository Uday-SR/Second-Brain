import express, {} from "express";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./routers/user.js";
import contentRouter from "./routers/content.js";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
const app = express();
// Middlewares
app.use(express.json());
app.use(cors({
    origin: "https://second-brain-frontend-beryl.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);
// Health check route 
app.get("/api/health", async (_req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ ok: true, users: userCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: "Internal Server Error" });
    }
});
export default app;
const port = process.env.PORT;
app.listen(port, () => { console.log(`App listening on port ${port}`); });
//# sourceMappingURL=index.js.map