import { Router } from "express";
import { itemExpiring, showStatus } from "../controllers/dashboard";

const router = Router();

router.get("/status", showStatus);
router.get("/expiring", itemExpiring);

export default router;
