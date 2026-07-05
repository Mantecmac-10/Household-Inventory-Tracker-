import { Router } from "express";
import { verifyUser } from "../middlewares/auth";


const router = Router()

router.post('/',verifyUser,)