import type { Request, Response, NextFunction } from "express";
import User from "../models/user";
import items from "../models/items";
import { sendExpiryEmail } from "../queue/producer";

export const listItems = async (req: Request, res: Response) => {
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

export const createItem = async (req: Request, res: Response) => {
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

export const markStatus = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const creatorId = req.params.creatorId;
    const status = req.body.status;

    const validStatuses = [
      "fresh",
      "expiring-soon",
      "expired",
      "used",
      "wasted",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).send("Invalid Status Value!");
    }

    const item = await items.findById(itemId);

    if (!item) {
      return res.status(400).send("Item not Found!");
    }

    if (item.addedBy?.toString() !== creatorId?.toString()) {
      return res.status(403).send("Access Denied!");
    }

    item.status = status;
    await item.save();

    return res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    console.error(error);
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const parsedData = req.body;
    const creatorId = req.userId;

    const { name, category, quantity, expiryDate, status } = req.body;

    const Item = await items.findById(itemId);

    if (!Item) {
      return res.status(400).send("Invalid Item ID!");
    }

    if (Item.addedBy?.toString() !== creatorId?.toString()) {
      return res.status(403).send("Access Denied");
    }

    const updatedItem = await items.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        quantity,
        expiryDate,
        status,
      },
      { new: true },
    );

    if (expiryDate) {
      const householdMembers = await User.find({
        householdId: Item.householdId,
      }).select("email");

      const emails = householdMembers.map((u) => u.email);

      const delay = new Date(expiryDate).getTime() - Date.now();

      if (delay <= 0) return; // don't schedule

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
    }
    return res.status(200).send({ message: "Item Updated!", updatedItem });
  } catch (error) {
    console.error(error);
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id;
    const creatorId = req.userId;

    const Item = await items.findById(itemId);

    if (!Item) {
      return res.status(400).send("Invalid Item ID!");
    }

    if (Item.addedBy?.toString() !== creatorId?.toString()) {
      return res.status(403).send("Access Denied!");
    }

    await items.findByIdAndDelete(itemId);

    return res.status(200).send("Item Deleted!");
  } catch (error) {
    console.error(error);
  }
};
