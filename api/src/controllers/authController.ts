// this is the auth controller

import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import type {
  LoginUserInput,
  RegisterUserInput,
} from "../schemas/auth.schema.js";

export const registerUser = async (
  req: Request<unknown, unknown, RegisterUserInput>,
  res: Response,
  next: NextFunction,
) => {
  // Registration logic goes here

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // create token

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // send the token to the client within a cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request<unknown, unknown, LoginUserInput>,
  res: Response,
  next: NextFunction,
) => {
  // compare credentials
  try {
    const { email, password } = req.body;
    // // basic presense validation   **** NO longer required after integrating zod validation
    // if (!email || !password) {
    //   return res
    //     .status(400)
    //     .json({ message: "Email and password are required" });
    // }

    // find User in database

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    // send the token to the client within a cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};
