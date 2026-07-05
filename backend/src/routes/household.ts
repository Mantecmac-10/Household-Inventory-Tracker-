import { Router } from "express";
import { verifyUser } from "../middlewares/auth";
import {
  createHousehold,
  getcurrentHousehold,
  getMembers,
  joinHoushold,
} from "../controllers/household";

const router = Router();

router.use(verifyUser);

router.post("/", createHousehold);
router.post("/join", joinHoushold);
router.get("/me", getcurrentHousehold);
router.get("/:id/members", getMembers);

export default router;
