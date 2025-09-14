import type { Request, Response, NextFunction } from "express"
import Jwt, { type JwtPayload } from "jsonwebtoken";
import JWT_SECRET from "../config.js";

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

function userMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(403).json({
            msg: "No token provided"
        })
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    const decoded = Jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.id

    next();

}

export default userMiddleware;