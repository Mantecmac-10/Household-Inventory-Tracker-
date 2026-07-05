import type { Request, Response, NextFunction } from "express";
import { generateInviteCode } from "../helpers/inviteCode";
import household from "../models/household";
import User from "../models/user";

export const createHousehold = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const creatorId = req.userId as string;

    const { name, inviteCode, members, wasteScore } = req.body;

    const code = generateInviteCode();

    const houseHold = await household.create({
      name,
      inviteCode: code,
      members: [creatorId],
      wasteScore,
    });

    const user = await User.findById(creatorId);

    if (!user) {
      return res.status(400).send("Invalid User Id");
    }

    user.householdId = houseHold._id;

    await user.save();

    return res.status(201).send({ message: "Household Created", houseHold });
  } catch (error) {
    next(error);
  }
};

export const joinHoushold = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inviteCode = req.body.inviteCode;
    const userId = req.userId;

    const houseHold = await household.findOne({ inviteCode });
  } catch (error) {
    next(error);
  }
};
