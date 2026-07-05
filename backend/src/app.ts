import express from "express";

const app = express();

app.use(express.json());

import authRouter from "./routes/auth";
import householdRouter from "./routes/household";

app.use("/api/auth", authRouter);
app.use("/api/households", householdRouter);

export { app };
