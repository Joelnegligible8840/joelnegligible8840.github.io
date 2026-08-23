import { Router } from "express";
import { db, resourcesTable } from "@workspace/db";

const router = Router();

// GET /tags
router.get("/tags", async (req, res): Promise<void> => {
  const rows = await db.select({ tags: resourcesTable.tags }).from(resourcesTable);

  const tagCounts: Record<string, number> = {};
  for (const row of rows) {
    for (const tag of row.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const result = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});

export default router;
