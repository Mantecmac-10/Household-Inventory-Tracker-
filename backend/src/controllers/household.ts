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

    const existhouseHold = await household.findOne({ inviteCode });
    if (!existhouseHold) {
      return res.status(400).json({ message: "Invalid Invite Code!" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User Doesn't Exists" });
    }

    const alreadyMember = existhouseHold.members.some(
      (memberId) => memberId.toString() === user._id.toString(),
    );
    if (alreadyMember) {
      return res
        .status(400)
        .send("User is already the member of this Household!");
    }

    existhouseHold.members.push(user._id);

    await existhouseHold.save();

    user.householdId = existhouseHold._id;

    await user.save();

    return res
      .status(200)
      .json({ message: "New User Added!", members: existhouseHold.members });
  } catch (error) {
    next(error);
  }
};

export const getcurrentHousehold = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).send("User Doesn't Exists");
    }

    const householdId = user.householdId;

    const houseHold = await household.findById(householdId);

    if (!houseHold) {
      return res.status(400).send("Invalid ID");
    }

    return res
      .status(200)
      .send({ message: "Household of this User", houseHold });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const householdId = req.params.householdId;

    const houseHold = await household.findById(householdId);

    if (!houseHold) {
      return res.status(400).send("Invalid Household ID!");
    }

    const result = houseHold.members;

    return res.status(200).send({ message: "List of Members ", result });
  } catch (error) {
    next();
  }
};
