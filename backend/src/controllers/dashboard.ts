import type { Request, Response, NextFunction } from "express";
import user from "../models/user";
import household from "../models/household";
import items from "../models/items";

export const showStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const User = await user.findById(userId);
    if (!User || !User.householdId) {
      return res.status(403).send("User is not part of any Household.");
    }

    const Household = await household.findById(User.householdId);
    if (!Household) {
      return res.status(404).send("Household Not Found");
    }

    const statusCounts = await items.aggregate([
      { $match: { householdId: User.householdId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {
      fresh: 0,
      "expiring-soon": 0,
      expired: 0,
      used: 0,
      wasted: 0,
    };

    for (const entry of statusCounts) {
      if (entry._id) counts[entry._id] = entry.count;
    }

    const used = counts.used ?? 0;
    const wasted = counts.wasted ?? 0;
    const total = used + wasted;
    const wasteScore = total > 0 ? Math.round((used / total) * 100) : 0;

    Household.wasteScore = wasteScore;
    await Household.save();

    return res
      .status(200)
      .json({ message: "Dashboard Stats", wasteScore, counts });
  } catch (error) {
    console.error(error);
  }
};

export const itemExpiring = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const User = await user.findById(userId);
    if (!User || !User.householdId) {
      return res.status(403).send("User is not part of any Household");
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiringItems = await items
      .find({
        householdId: User.householdId,
        expiryDate: { $gte: now, $lte: in24Hours },
        status: { $nin: ["used", "wasted"] },
      })
      .sort({ expiryDate: 1 });

    return res
      .status(200)
      .json({ message: "List of Items Expiring in 24 Hours", expiringItems });
  } catch (error) {
    console.error(error);
  }
};
