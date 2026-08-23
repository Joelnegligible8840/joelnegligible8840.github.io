import { Router } from "express";
import { sql, eq } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";

const router = Router();

// GET /stats
router.get("/stats", async (req, res): Promise<void> => {
  const [totalRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(resourcesTable);

  const byCategory = await db
    .select({
      name: resourcesTable.category,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(resourcesTable)
    .groupBy(resourcesTable.category)
    .orderBy(sql`count(*) desc`);

  const byType = await db
    .select({
      name: resourcesTable.type,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(resourcesTable)
    .groupBy(resourcesTable.type)
    .orderBy(sql`count(*) desc`);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(resourcesTable)
    .where(sql`${resourcesTable.createdAt} >= ${sevenDaysAgo}`);

  const [featuredRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(resourcesTable)
    .where(eq(resourcesTable.featured, true));

  res.json({
    totalResources: totalRow?.count ?? 0,
    byCategory,
    byType,
    recentCount: recentRow?.count ?? 0,
    featuredCount: featuredRow?.count ?? 0,
  });
});

export default router;
