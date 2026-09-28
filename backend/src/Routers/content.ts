import { Router } from "express";
import { prisma } from "../lib/prisma";
import userMiddleware from "../middlewares/user";

const contentRouter = Router();
const client = prisma;

// Kept in sync with ai_service/app/loaders/__init__.py's KNOWN_TYPES.
const KNOWN_TYPES = new Set([
  "youtube",
  "twitter",
  "article",
  "url",
  "pdf",
  "markdown",
  "text",
  "image",
  "audio",
  "github",
]);

contentRouter.post("/", userMiddleware, async (req, res) => {
  const { title, link, description, tags, type } = req.body;
  const userId = Number(req.userId);

  if (!title || !link) {
    return res.status(400).json({ msg: "Title and link are required." });
  }

  const normalizedType = KNOWN_TYPES.has(type) ? type : "url";

  try {
    const newContent = await client.content.create({
      data: {
        title,
        link,
        description: description || "",
        tags: tags || "",
        type: normalizedType,
        userId,
        // status defaults to PENDING in the schema — the frontend triggers
        // AI-service processing separately, then polls /status.
      },
    });

    res.json({
      msg: "Content added successfully",
      content: newContent,
      id: newContent.id,
    });
  } catch (e) {
    res.status(400).json({ msg: "Error adding content" });
  }
});

contentRouter.get("/contents", userMiddleware, async (req, res) => {
  try {
    const userId = Number(req.userId);

    const contents = await client.content.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(contents);
  } catch (e) {
    res.status(400).json({ msg: "Error fetching contents" });
  }
});

// Lets the frontend update status/error after the AI service finishes a job,
// without exposing the AI service directly to the whole internet.
contentRouter.patch("/:id/status", userMiddleware, async (req, res) => {
  const contentId = Number(req.params.id);
  const userId = Number(req.userId);
  const { status, error, contentHash } = req.body;

  const ALLOWED = ["PENDING", "PROCESSING", "DONE", "FAILED"];
  if (!ALLOWED.includes(status)) {
    return res.status(400).json({ msg: "Invalid status." });
  }

  try {
    const updated = await client.content.updateMany({
      where: { id: contentId, userId },
      data: { status, error: error ?? null, contentHash: contentHash ?? undefined },
    });

    if (updated.count === 0) {
      return res.status(404).json({ msg: "Content not found." });
    }

    res.json({ msg: "Status updated" });
  } catch (e) {
    res.status(400).json({ msg: "Error updating status" });
  }
});

contentRouter.delete("/:id", userMiddleware, async (req, res) => {
  const contentId = Number(req.params.id);
  const userId = Number(req.userId);

  try {
    const deleted = await client.content.deleteMany({
      where: { id: contentId, userId },
    });

    if (deleted.count === 0) {
      return res.status(403).json({ msg: "Not authorized to delete this content" });
    }

    res.json({ msg: "Content deleted successfully" });
  } catch (e) {
    res.status(400).json({ msg: "Error deleting content" });
  }
});

export default contentRouter;
