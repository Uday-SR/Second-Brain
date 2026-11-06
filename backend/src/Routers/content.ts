import { Router } from "express";
import Jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import JWT_SECRET from "../config";
import userMiddleware from "../middlewares/user";

const contentRouter = Router();
const client = prisma;

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


const SHARE_SECRET = `${JWT_SECRET}:share`;
const SHARE_EXPIRY = "30d";

function tagList(raw: string | null | undefined): string[] {
  return (raw || "")
    .split(/[,#]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

contentRouter.post("/share", userMiddleware, (req, res) => {
  const userId = Number(req.userId);

  const types: string[] = Array.isArray(req.body?.types)
    ? req.body.types.filter((t: unknown) => typeof t === "string" && KNOWN_TYPES.has(t))
    : [];
  const tag = typeof req.body?.tag === "string" ? req.body.tag.trim().slice(0, 100) : "";
  const label = typeof req.body?.label === "string" ? req.body.label.trim().slice(0, 60) : "";

  const token = Jwt.sign({ kind: "share", uid: userId, types, tag, label }, SHARE_SECRET, {
    expiresIn: SHARE_EXPIRY,
  });

  res.json({ token, expiresInDays: 30 });
});

contentRouter.get("/shared/:token", async (req, res) => {
  let payload: JwtPayload;
  try {
    payload = Jwt.verify(req.params.token as string, SHARE_SECRET) as JwtPayload;
  } catch (e) {
    return res.status(404).json({ msg: "This share link is invalid or has expired." });
  }

  if (payload.kind !== "share" || typeof payload.uid !== "number") {
    return res.status(404).json({ msg: "This share link is invalid or has expired." });
  }

  const types: string[] = Array.isArray(payload.types)
    ? payload.types.filter((t: unknown) => typeof t === "string")
    : [];
  const tag = typeof payload.tag === "string" ? payload.tag.trim().toLowerCase() : "";

  try {
    const owner = await client.user.findUnique({
      where: { id: payload.uid },
      select: { username: true },
    });

    if (!owner) {
      return res.status(404).json({ msg: "This share link is invalid or has expired." });
    }

    const rows = await client.content.findMany({
      where: {
        userId: payload.uid,
        ...(types.length ? { type: { in: types } } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        link: true,
        description: true,
        tags: true,
        type: true,
        createdAt: true,
      },
    });

    const contents = tag ? rows.filter((r) => tagList(r.tags).includes(tag)) : rows;

    res.json({
      owner: owner.username,
      label: typeof payload.label === "string" ? payload.label : "",
      expiresAt: payload.exp ? payload.exp * 1000 : null,
      contents,
    });
  } catch (e) {
    res.status(400).json({ msg: "Error loading shared content" });
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
