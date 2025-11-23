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
            error: "User already exists"
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
            error: "Error creating user"
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
                error: "User doesn't exist!"
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
            error: "Error Creating User!"
        });
    }
});
export default userRouter;
//# sourceMappingURL=user.js.map