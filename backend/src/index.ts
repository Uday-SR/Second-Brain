import express from "express";
import userRouter from "./Routers/user.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/v1/user", userRouter);

app.listen(port, () => {
    console.log(`App listening on port : ${port}`);
})
