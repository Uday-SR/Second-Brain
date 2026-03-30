import { Router } from 'express';
import { prisma } from '../lib/prisma';
import userMiddleware from '../middlewares/user';

const contentRouter = Router();
const client = prisma;

contentRouter.post("/", userMiddleware, async (req, res) => {

    const { title, link, description, tags, type } = req.body;
    const userId = Number(req.userId);

    try {
        const newContent = await client.content.create({
            data: {
                title,
                link,
                description,
                tags,
                type,
                userId
            }
        });

        res.json({
            msg: "Content added successfully",
            content: newContent,
            id: newContent.id
        });

    } catch (e) {
        res.status(400).json({
            msg: "Error adding content"
        });
    }
});

contentRouter.get("/contents", userMiddleware, async (req, res) => {
    try {
        const userId = Number(req.userId);

        const contents = await client.content.findMany({
            where: {
                userId: userId
            }
        });

        res.json(contents);

    } catch (e) {
        res.status(400).json({
            msg: "Error fetching contents"
        });
    }
});

contentRouter.delete("/:id", userMiddleware, async (req, res) => {

    const contentId = Number(req.params.id);
    const userId = Number(req.userId);

    try {
        const deleted = await client.content.deleteMany({
            where: {
                id: contentId,
                userId: userId
            }
        });

        if (deleted.count === 0) {
            return res.status(403).json({
                msg: "Not authorized to delete this content"
            });
        }

        res.json({
            msg: "Content deleted successfully"
        });

    } catch (e) {
        res.status(400).json({
            msg: "Error deleting content"
        });
    }
});

export default contentRouter;