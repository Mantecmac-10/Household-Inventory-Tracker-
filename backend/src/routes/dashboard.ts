import { Router } from "express";
import { itemExpiring, showStatus } from "../controllers/dashboard";
import { verifyUser } from "../middlewares/auth";

const router = Router();

router.use(verifyUser);

router.get("/status", showStatus);
router.get("/expiring", itemExpiring);

export default router;
