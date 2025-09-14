import Jwt, {} from "jsonwebtoken";
import JWT_SECRET from "../config.js";
function userMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({
            msg: "No token provided"
        });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    const decoded = Jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
}
export default userMiddleware;
//# sourceMappingURL=user.js.map