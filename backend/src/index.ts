import express from "express";
import userRouter from "./routers/user.js";
import contentRouter from "./routers/content.js";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

app.listen(port, () => {
    console.log(`App listening on port : ${port}`);
});
