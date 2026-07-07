import express from "express";

const app = express();

app.use(express.json());

import authRouter from "./routes/auth";
import householdRouter from "./routes/household";
import itemRouter from "./routes/item";

app.use("/api/auth", authRouter);
app.use("/api/households", householdRouter);
app.use("/api/items", itemRouter);

export { app };
