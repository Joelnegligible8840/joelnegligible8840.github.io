import { Router } from "express";
import { sql } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";

const router = Router();

// GET /categories
router.get("/categories", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      name: resourcesTable.category,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(resourcesTable)
    .groupBy(resourcesTable.category)
    .orderBy(sql`count(*) desc`);

  res.json(rows);
});

export default router;
