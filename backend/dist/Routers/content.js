import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import userMiddleware from '../middlewares/user.js';
const contentRouter = Router();
const client = prisma;
contentRouter.post("/", userMiddleware, async (req, res) => {
    const { title, link, description, tags, type } = req.body;
    const userId = Number(req.userId);
    try {
        const newContent = await client.content.create({
            data: {
                title: title,
                link: link,
                description: description,
                tags: tags,
                type: type,
                userId: userId
            }
        });
        res.json({
            msg: "Content added successfully",
            content: newContent,
            id: newContent.id
        });
    }
    catch (e) {
        res.status(400).json({
            msg: "Error adding content"
        });
    }
});
contentRouter.get("/contents", async (req, res) => {
    try {
        const contents = await client.content.findMany();
        res.json(contents);
    }
    catch (e) {
        res.status(400).json({
            msg: "Error fetching contents"
        });
    }
});
contentRouter.delete("/:id", async (req, res) => {
    const contentId = Number(req.params.id);
    try {
        await client.content.delete({
            where: {
                id: contentId
            }
        });
        res.json({
            msg: "Content deleted successfully"
        });
    }
    catch (e) {
        res.status(400).json({
            msg: "Error deleting content"
        });
    }
});
export default contentRouter;
//# sourceMappingURL=content.js.map