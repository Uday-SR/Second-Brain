import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import Jwt from "jsonwebtoken";
import JWT_SECRET from "../config.js";
import userMiddleware from "../middlewares/user.js";
const userRouter = Router();
const client = new PrismaClient();
userRouter.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const userExists = await client.user.findFirst({
        where: {
            email
        }
    });
    if (userExists)
        return res.status(400).json({
            msg: "User already exists"
        });
    try {
        const newUser = await client.user.create({
            data: {
                username,
                email,
                password
            }
        });
        const token = await Jwt.sign({
            id: newUser.id
        }, JWT_SECRET);
        return res.status(200).json({
            msg: "User created Successfully",
            token: token
        });
    }
    catch (e) {
        return res.status(400).json({
            msg: "Error creating user"
        });
    }
});
userRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await client.user.findFirst({
            where: {
                email
            }
        });
        if (!userExists) {
            return res.status(400).json({
                msg: "User doesn't exist!"
            });
        }
        const token = await Jwt.sign({
            id: userExists.id
        }, JWT_SECRET);
        return res.status(200).json({
            msg: "Signed In successfully",
            token: token
        });
    }
    catch (e) {
        return res.json(400).json({
            msg: "Error Creating User!"
        });
    }
});
userRouter.post("/content", userMiddleware, async (req, res) => {
    const { title, link, tags } = req.body;
    const user = Number(req.userId);
    const content = await client.content.create({
        data: {
            title,
            link,
            tags,
            userId: user
        }
    });
    res.json({
        msg: "content created",
        contentId: content.id
    });
});
userRouter.put("/content", (req, res) => {
});
userRouter.delete("/content", (req, res) => {
});
export default userRouter;
//# sourceMappingURL=user.js.map