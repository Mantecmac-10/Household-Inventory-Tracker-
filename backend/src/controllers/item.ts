import type { Request, Response, NextFunction } from "express";
import User from "../models/user";
import household from "../models/household";
import items from "../models/items";
import { sendExpiryEmail } from "../queue/producer";

export const listItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { status, category } = req.query;

    const user = await User.findById(userId);

    if (!user || !user.householdId) {
      return res.status(403).send("User is not part of this Household");
    }

    const filter: Record<string, unknown> = { householdId: user.householdId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const householdItems = await items.find(filter);
    if (!householdItems) {
      return res.status(403).send("Items Not Found!");
    }

    return res.status(200).json({ message: "Items Fetched", householdItems });
  } catch (error) {
    console.error(error);
  }
};

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, category, quantity, expiryDate } = req.body;

    const user = await User.findById(req.userId);

    if (!user || !user.householdId) {
      return res.status(403).send("User is not part of any Household");
    }

    const Item = await items.create({
      name,
      householdId: user.householdId,
      addedBy: req.userId,
      category,
      quantity,
      expiryDate,
    });

    const householdMembers = await User.find({
      householdId: user.householdId,
    }).select("email");

    const emails = householdMembers.map((u) => u.email);

    const delay = new Date(expiryDate).getTime() - Date.now();

    if (delay <= 0) return;
    if (delay > 0) {
      sendExpiryEmail(
        {
          emails,
          itemName: name,
          expiryDate,
          itemId: Item._id.toString(),
        },
        { delay },
      ).catch((err) => console.error("failed to queue email:", err));
    }
    return res.status(201).send({ message: "item created", Item });
  } catch (error) {
    console.error(error);
  }
};
