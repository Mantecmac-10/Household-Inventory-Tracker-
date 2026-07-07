import { Router } from "express";
import {
  createItem,
  listItems,
  markStatus,
  removeItem,
  updateItem,
} from "../controllers/item";

const router = Router();

router.get("/", listItems);
router.post("/", createItem);
router.patch("/:id/status", markStatus);
router.put("/:id", updateItem);
router.delete("/:id", removeItem);

export default router;
