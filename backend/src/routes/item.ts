import { Router } from "express";
import {
  createItem,
  listItems,
  markStatus,
  removeItem,
  updateItem,
} from "../controllers/item";
import { verifyUser } from "../middlewares/auth";

const router = Router();

router.use(verifyUser);

router.get("/", listItems);
router.post("/", createItem);
router.patch("/:id/status", markStatus);
router.put("/:id", updateItem);
router.delete("/:id", removeItem);

export default router;
