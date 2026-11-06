import type { Request, Response, NextFunction } from "express"
import Jwt, { type JwtPayload } from "jsonwebtoken";
import JWT_SECRET from "../config";

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

    try {
        const decoded = Jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (decoded.id === undefined || decoded.id === null) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userId = String(decoded.id);
    } catch (e) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    next();

}

export default userMiddleware;
