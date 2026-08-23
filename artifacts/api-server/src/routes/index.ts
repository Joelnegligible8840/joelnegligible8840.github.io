import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resourcesRouter from "./resources";
import categoriesRouter from "./categories";
import tagsRouter from "./tags";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resourcesRouter);
router.use(categoriesRouter);
router.use(tagsRouter);
router.use(statsRouter);

export default router;
