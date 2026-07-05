import type { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return res.status(400).send("Email Already Exist!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const result = await User.findById(user._id).select("-password");

    res.status(201).send(result);
  } catch (err) {
    next(err);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(400).send("Invalid Credentials");
    }

    const validPass = await bcrypt.compare(password, existUser.password);
    if (!validPass) {
      return res.status(400).send("Invalid Credentials");
    }

    const token = jwt.sign(
      {
        id: existUser._id,
        email,
      },
      config.JWT_KEY,
    );
    res.status(200).json({ message: "signin done", token });
  } catch (err) {
    next(err);
  }
};
