import { Router } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import {
  ListResourcesQueryParams,
  CreateResourceBody,
  GetResourceParams,
  UpdateResourceParams,
  UpdateResourceBody,
  DeleteResourceParams,
} from "@workspace/api-zod";

const router = Router();

// GET /resources
router.get("/resources", async (req, res): Promise<void> => {
  const parsed = ListResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, tag, q, featured } = parsed.data;

  let query = db.select().from(resourcesTable);

  const conditions = [];

  if (category) {
    conditions.push(eq(resourcesTable.category, category));
  }

  if (featured === true) {
    conditions.push(eq(resourcesTable.featured, true));
  }

  if (q) {
    conditions.push(
      or(
        ilike(resourcesTable.title, `%${q}%`),
        ilike(resourcesTable.description, `%${q}%`),
      ),
    );
  }

  let rows;
  if (conditions.length > 0) {
    rows = await query.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions.slice(1).reduce((a, b) => sql`${a} AND ${b}`)}`);
  } else {
    rows = await query;
  }

  // Filter by tag in memory since array contains is tricky
  if (tag) {
    rows = rows.filter((r) => r.tags.includes(tag));
  }

  const result = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    url: r.url,
    category: r.category,
    tags: r.tags,
    type: r.type,
    difficulty: r.difficulty,
    language: r.language,
    featured: r.featured,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

// POST /resources
router.post("/resources", async (req, res): Promise<void> => {
  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [created] = await db
    .insert(resourcesTable)
    .values({
      title: data.title,
      description: data.description,
      url: data.url,
      category: data.category,
      tags: data.tags ?? [],
      type: data.type,
      difficulty: data.difficulty,
      language: data.language ?? null,
      featured: data.featured ?? false,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    title: created.title,
    description: created.description,
    url: created.url,
    category: created.category,
    tags: created.tags,
    type: created.type,
    difficulty: created.difficulty,
    language: created.language,
    featured: created.featured,
    createdAt: created.createdAt.toISOString(),
  });
});

// GET /resources/featured
router.get("/resources/featured", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(resourcesTable)
    .where(eq(resourcesTable.featured, true))
    .limit(8);

  const result = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    url: r.url,
    category: r.category,
    tags: r.tags,
    type: r.type,
    difficulty: r.difficulty,
    language: r.language,
    featured: r.featured,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(result);
});

// GET /resources/:id
router.get("/resources/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetResourceParams.safeParse({ id: rawId });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [row] = await db
    .select()
    .from(resourcesTable)
    .where(eq(resourcesTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json({
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    category: row.category,
    tags: row.tags,
    type: row.type,
    difficulty: row.difficulty,
    language: row.language,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  });
});

// PATCH /resources/:id
router.patch("/resources/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramParsed = UpdateResourceParams.safeParse({ id: rawId });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const bodyParsed = UpdateResourceBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const data = bodyParsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.featured !== undefined) updateData.featured = data.featured;

  const [updated] = await db
    .update(resourcesTable)
    .set(updateData)
    .where(eq(resourcesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    url: updated.url,
    category: updated.category,
    tags: updated.tags,
    type: updated.type,
    difficulty: updated.difficulty,
    language: updated.language,
    featured: updated.featured,
    createdAt: updated.createdAt.toISOString(),
  });
});

// DELETE /resources/:id
router.delete("/resources/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteResourceParams.safeParse({ id: rawId });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(resourcesTable)
    .where(eq(resourcesTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.status(204).send();
});

export default router;
